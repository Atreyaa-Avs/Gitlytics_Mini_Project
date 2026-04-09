"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ThreadContextType {
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  createNewThread: () => Promise<string>;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

export function ThreadProvider({ children }: { children: ReactNode }) {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  useEffect(() => {
    // Load from sessionStorage on mount
    const saved = sessionStorage.getItem("activeThreadId");
    if (saved) {
      setActiveThreadId(saved);
    }
  }, []);

  const handleSetActiveThreadId = (id: string | null) => {
    setActiveThreadId(id);
    if (id) {
      sessionStorage.setItem("activeThreadId", id);
    } else {
      sessionStorage.removeItem("activeThreadId");
    }
  };

  const createNewThread = async () => {
    const response = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Thread" }),
    });

    if (!response.ok) {
      throw new Error("Failed to create thread");
    }

    const thread = await response.json();
    handleSetActiveThreadId(thread.id);
    return thread.id;
  };

  return (
    <ThreadContext.Provider
      value={{
        activeThreadId,
        setActiveThreadId: handleSetActiveThreadId,
        createNewThread,
      }}
    >
      {children}
    </ThreadContext.Provider>
  );
}

export function useThread() {
  const context = useContext(ThreadContext);
  if (!context) {
    throw new Error("useThread must be used within ThreadProvider");
  }
  return context;
}
