"use client";

interface HumanMessageProps {
  content: string;
}

export function HumanMessage({ content }: HumanMessageProps) {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="flex-1 bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-sm font-semibold">
        U
      </div>
    </div>
  );
}
