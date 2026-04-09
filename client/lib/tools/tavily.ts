import { tavily } from "@tavily/core";
import { z } from "zod";

/**
 * Tavily web search tool for the AI assistant
 * Searches the web and returns relevant results
 */
export const tavilySearchTool = {
  description:
    "Search the web for current information, news, or data. Use this when you need up-to-date information that may not be in your training data.",
  inputSchema: z.object({
    query: z.string().describe("The search query to look up on the web"),
    max_results: z
      .number()
      .optional()
      .describe("Maximum number of results to return (default: 5, max: 10)"),
  }),
  execute: async ({
    query,
    max_results = 5,
  }: {
    query: string;
    max_results?: number;
  }) => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      console.error("[Tavily Tool] TAVILY_API_KEY is not configured");
      throw new Error("TAVILY_API_KEY environment variable is not configured");
    }

    console.log("[Tavily Tool] Executing search:", { query, max_results });

    const client = tavily({ apiKey });

    try {
      const response = await client.search(query, {
        maxResults: Math.min(max_results, 10),
      });

      console.log("[Tavily Tool] Search successful:", {
        resultsCount: response.results.length,
      });

      // Format results for the AI to understand
      const formattedResults = response.results
        .map((result, index) =>
          `
Result ${index + 1}:
Title: ${result.title}
URL: ${result.url}
Content: ${result.content}
          `.trim(),
        )
        .join("\n\n");

      return {
        success: true,
        query: response.query,
        results_count: response.results.length,
        results: formattedResults,
      };
    } catch (error) {
      console.error("[Tavily Tool] Error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        query,
      };
    }
  },
};
