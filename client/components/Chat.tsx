"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useThread } from "@/components/ThreadContext";
import { useChatContext } from "@/components/ChatProvider";
import { MessageList } from "@/components/MessageList";
import { MessageInput } from "@/components/MessageInput";
import { useEffect, useRef, useState, useCallback } from "react";

export function Chat() {
  const { activeThreadId, createNewThread } = useThread();
  const { apiKey, model, provider, approveAllTools } = useChatContext();
  const hasInitialized = useRef(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const chatTransport = new DefaultChatTransport({
    api: "/api/agent/stream",
    body: {
      threadId: activeThreadId,
      apiKey,
      model,
      provider,
      approveAllTools,
    },
  });

  const { messages, status, sendMessage, stop, regenerate } = useChat({
    transport: chatTransport,
    onError: (error) => {
      console.error("Chat error:", error);
      const errorMessage =
        error?.message || error?.toString() || "An error occurred";
      setError(errorMessage);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    },
    onFinish: () => {
      setError(null);
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      setError(null);
      sendMessage({ text: input });
      setInput("");
    },
    [input, isLoading, sendMessage],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [],
  );

  // Auto-create thread if none exists
  useEffect(() => {
    if (!activeThreadId && !isLoading) {
      createNewThread().catch(console.error);
    }
  }, [activeThreadId, isLoading, createNewThread]);

  if (!activeThreadId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">
          Creating thread...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </div>
      )}
      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        regenerate={regenerate}
      />
    </div>
  );
}
