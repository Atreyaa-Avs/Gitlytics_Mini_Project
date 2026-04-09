"use client";

import { Chat } from "@/components/Chat";
import { Sidebar } from "@/components/Sidebar";
import { ThreadProvider } from "@/components/ThreadContext";
import { useState } from "react";
import { IconMenu2 } from "@tabler/icons-react";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ThreadProvider>
      <div className="flex h-screen overflow-hidden">
        {sidebarOpen && (
          <div className="w-64 shrink-0">
            <Sidebar />
          </div>
        )}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="flex items-center gap-2 border-b px-4 py-2 shrink-0">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-muted rounded-md"
              >
                <IconMenu2 className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-lg font-semibold">Gitlytics AI</h1>
          </header>
          <main className="flex-1 overflow-hidden">
            <Chat />
          </main>
        </div>
      </div>
    </ThreadProvider>
  );
}
