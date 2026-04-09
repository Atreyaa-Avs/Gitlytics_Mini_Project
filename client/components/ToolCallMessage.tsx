"use client";

import { IconSearch, IconCheck, IconAlertCircle } from "@tabler/icons-react";

interface ToolCallMessageProps {
  toolName: string;
  args: Record<string, any>;
  result?: any;
  isPending?: boolean;
}

export function ToolCallMessage({
  toolName,
  args,
  result,
  isPending = false,
}: ToolCallMessageProps) {
  return (
    <div className="my-3 p-3 bg-muted/50 rounded-lg border border-muted-foreground/20">
      {/* Tool Call Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1 rounded bg-primary/10">
          {toolName === "web_search" ? (
            <IconSearch className="h-4 w-4 text-primary" />
          ) : (
            <div className="h-4 w-4" />
          )}
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          Using {toolName.replace(/_/g, " ")}
        </span>
        {isPending && (
          <div className="ml-auto">
            <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full" />
          </div>
        )}
        {result && !isPending && (
          <IconCheck className="ml-auto h-4 w-4 text-green-500" />
        )}
      </div>

      {/* Tool Arguments */}
      {args && (
        <div className="mb-2">
          <div className="text-xs text-muted-foreground mb-1">Arguments:</div>
          <div className="text-xs font-mono bg-background p-2 rounded overflow-x-auto">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(args, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Tool Result */}
      {result && (
        <div className="mt-2">
          <div className="text-xs text-muted-foreground mb-1">Result:</div>
          <div className="text-xs bg-background p-2 rounded">
            {result.success ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <IconCheck className="h-3 w-3" />
                  <span>
                    Found {result.results_count || 0} result(s) for "{result.query}"
                  </span>
                </div>
                <div className="text-muted-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {result.results?.substring(0, 500)}
                  {result.results?.length > 500 && "..."}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <IconAlertCircle className="h-3 w-3" />
                <span>{result.error || "Unknown error"}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
