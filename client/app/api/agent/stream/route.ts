import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { thread } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { tavilySearchTool } from "@/lib/tools/tavily";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      console.error("[Stream API] Unauthorized: No session found");
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const {
      messages,
      threadId,
      model,
      apiKey,
      provider,
    }: {
      messages: any[];
      threadId: string;
      model?: string;
      apiKey?: string;
      provider?: "google" | "groq";
    } = body;

    console.log("[Stream API] Request received:", {
      threadId,
      model,
      provider,
      messageCount: messages?.length,
    });

    if (!messages?.length) {
      return new NextResponse(
        JSON.stringify({ error: "Messages are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Ensure thread exists
    let existingThread;
    try {
      existingThread = await db.query.thread.findFirst({
        where: eq(thread.id, threadId),
      });
    } catch (err) {
      console.error("[Stream API] Failed to query thread:", err);
      return new NextResponse(
        JSON.stringify({
          error: "Database query failed",
          details: err instanceof Error ? err.message : String(err),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!existingThread) {
      console.log("[Stream API] Thread not found, creating new thread...");
      try {
        const firstMessage = messages[0];
        // Extract text content from UIMessage parts (v6 format)
        const textContent =
          firstMessage.parts
            ?.filter((p: any) => p.type === "text")
            .map((p: any) => p.text || "")
            .join(" ") || "New Thread";
        const title = textContent.slice(0, 50) || "New Thread";

        console.log("[Stream API] Inserting thread:", {
          userId: session.user.id,
          title,
        });

        const insertResult = await db
          .insert(thread)
          .values({
            userId: session.user.id,
            title,
          })
          .returning();

        existingThread = insertResult[0];
        console.log(
          "[Stream API] Thread created successfully:",
          existingThread?.id,
        );
      } catch (err) {
        console.error("[Stream API] Failed to create thread:", err);
        return new NextResponse(
          JSON.stringify({
            error: "Failed to create thread",
            details: err instanceof Error ? err.message : String(err),
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    // Determine provider (default to google)
    const selectedProvider = provider || "google";

    // Set API key based on provider
    let effectiveApiKey: string | undefined;
    if (selectedProvider === "groq") {
      effectiveApiKey = apiKey || process.env.GROQ_API_KEY;
      if (!effectiveApiKey) {
        console.error("[Stream API] GROQ_API_KEY is not configured");
        return new NextResponse(
          JSON.stringify({ error: "GROQ_API_KEY is required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    } else {
      effectiveApiKey = apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!effectiveApiKey) {
        console.error(
          "[Stream API] GOOGLE_GENERATIVE_AI_API_KEY is not configured",
        );
        return new NextResponse(
          JSON.stringify({ error: "GOOGLE_GENERATIVE_AI_API_KEY is required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    console.log("[Stream API] Converting UI messages to model messages...");

    // Convert UI messages to ModelMessage format (required for AI SDK v6)
    const modelMessages = await convertToModelMessages(messages);

    // Determine default model based on provider
    const defaultModel =
      selectedProvider === "groq"
        ? "llama-3.3-70b-versatile"
        : "gemini-2.5-flash";
    const selectedModel = model || defaultModel;

    console.log(
      "[Stream API] Calling AI with provider:",
      selectedProvider,
      "model:",
      selectedModel,
    );

    // Create provider instance with API key
    let aiModel;
    if (selectedProvider === "groq") {
      const groq = createGroq({
        apiKey: effectiveApiKey,
      });
      aiModel = groq(selectedModel);
    } else {
      const google = createGoogleGenerativeAI({
        apiKey: effectiveApiKey,
      });
      aiModel = google(selectedModel);
    }

    // Use AI SDK's streamText with selected provider
    const result = streamText({
      model: aiModel,
      messages: [
        {
          role: "system",
          content: `You are a helpful, professional AI assistant. Format responses in well-structured Markdown. Current date: ${new Date().toISOString().split("T")[0]}`,
        },
        ...modelMessages,
      ],
      tools: {
        web_search: tavilySearchTool,
      },
      stopWhen: stepCountIs(10), // Allow up to 10 steps of tool execution and continuous generation
      onStepFinish: (event) => {
        console.log("[Stream API] Step finished:", {
          stepType: event.stepType,
          toolCalls: event.toolCalls?.length || 0,
          text: event.text?.length || 0,
        });
      },
      onError: (error) => {
        console.error("[Stream API] Tool execution error:", error);
      },
    });

    console.log("[Stream API] Stream initiated successfully");
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[Stream API] Unexpected error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
