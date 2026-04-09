"use client";

import { UIMessage } from "ai";
import { AIMessage } from "@/components/AIMessage";
import { HumanMessage } from "@/components/HumanMessage";
import { ToolCallMessage } from "@/components/ToolCallMessage";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Debug: log all messages to see their structure
    console.log("[MessageList] Messages:", JSON.stringify(messages, null, 2));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper to extract text from message parts
  const getMessageText = (msg: UIMessage): string => {
    return (
      msg.parts
        ?.filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("\n") || ""
    );
  };

  return (
    <div className="px-4">
      <div className="max-w-3xl mx-auto py-4 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">
              Welcome to Gitlytics AI
            </h2>
            <p className="text-muted-foreground">
              Ask me anything. I can help with analytics, data insights, and
              more.
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={message.id || index} className="space-y-2">
            {message.role === "user" ? (
              <HumanMessage content={getMessageText(message)} />
            ) : (
              <>
                {/* Render tool call parts - format: "tool-{toolName}" */}
                {message.parts
                  ?.filter((p) => p.type && p.type.startsWith("tool-"))
                  .map((part: any, idx) => {
                    // Extract tool name from type (e.g., "tool-web_search" -> "web_search")
                    const toolName = part.type.replace("tool-", "");
                    const isOutputAvailable = part.state === "output-available";
                    const isInputStreaming = part.state === "input-streaming";

                    return (
                      <ToolCallMessage
                        key={idx}
                        toolName={toolName}
                        args={part.input || part.args || {}}
                        result={part.output || part.result}
                        isPending={
                          isLoading &&
                          !isOutputAvailable &&
                          index === messages.length - 1
                        }
                      />
                    );
                  })}

                {/* Render text content */}
                <AIMessage
                  content={getMessageText(message)}
                  isLoading={isLoading && index === messages.length - 1}
                />
              </>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
