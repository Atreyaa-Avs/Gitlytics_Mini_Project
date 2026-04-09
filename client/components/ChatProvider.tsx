"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ChatContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
  provider: "google" | "groq";
  setProvider: (provider: "google" | "groq") => void;
  approveAllTools: boolean;
  setApproveAllTools: (value: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [provider, setProvider] = useState<"google" | "groq">("google");
  const [approveAllTools, setApproveAllTools] = useState(false);

  return (
    <ChatContext.Provider
      value={{
        apiKey,
        setApiKey,
        model,
        setModel,
        provider,
        setProvider,
        approveAllTools,
        setApproveAllTools,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
}
