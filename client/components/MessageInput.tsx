"use client";

import { Button } from "@/components/ui/button";
import { IconArrowUp, IconSquare, IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import { ChatSettings } from "@/components/ChatSettings";
import { ModelSelector } from "@/components/ModelSelector";

interface MessageInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  stop: () => void;
  regenerate: () => void;
}

export function MessageInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  regenerate,
}: MessageInputProps) {
  const [showSettings, setShowSettings] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-3">
        {/* Model Selector */}
        <div className="flex justify-start">
          <ModelSelector />
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full rounded-lg border bg-input px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[56px] max-h-[200px]"
            rows={1}
            disabled={isLoading}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            {isLoading ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={stop}
                className="h-8 w-8"
              >
                <IconSquare className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={!input.trim()}
                className="h-8 w-8"
              >
                <IconArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-xs"
          >
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={regenerate}
            className="text-xs"
          >
            <IconRefresh className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </div>

        {showSettings && <ChatSettings />}
      </div>
    </div>
  );
}
