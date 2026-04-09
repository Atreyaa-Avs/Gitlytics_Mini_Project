"use client";

import { useThread } from "@/components/ThreadContext";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconTrash,
  IconPencil,
  IconChevronLeft,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";

interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export function Sidebar() {
  const { activeThreadId, setActiveThreadId, createNewThread } = useThread();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const response = await fetch("/api/threads");
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error("Failed to fetch threads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateThread = async () => {
    try {
      const id = await createNewThread();
      await fetchThreads();
    } catch (error) {
      console.error("Failed to create thread:", error);
    }
  };

  const handleSelectThread = (id: string) => {
    setActiveThreadId(id);
  };

  const handleDeleteThread = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/threads?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setThreads(threads.filter((t) => t.id !== id));
        if (activeThreadId === id) {
          setActiveThreadId(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete thread:", error);
    }
  };

  const handleRenameThread = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/threads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title: editingTitle }),
      });
      if (response.ok) {
        setEditingId(null);
        await fetchThreads();
      }
    } catch (error) {
      console.error("Failed to rename thread:", error);
    }
  };

  return (
    <div className="flex flex-col h-full border-r bg-muted/30">
      <div className="p-3 border-b">
        <Button
          onClick={handleCreateThread}
          className="w-full"
          variant="outline"
        >
          <IconPlus className="h-4 w-4 mr-2" />
          New Thread
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${
                  activeThreadId === thread.id ? "bg-muted" : ""
                }`}
                onClick={() => handleSelectThread(thread.id)}
              >
                {editingId === thread.id ? (
                  <form
                    onSubmit={(e) => handleRenameThread(thread.id, e)}
                    className="flex-1"
                  >
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => {
                        if (editingTitle) {
                          handleRenameThread(thread.id, {
                            preventDefault: () => {},
                          } as React.FormEvent);
                        }
                        setEditingId(null);
                      }}
                      className="w-full bg-background border rounded px-2 py-1 text-sm"
                      autoFocus
                    />
                  </form>
                ) : (
                  <>
                    <span className="flex-1 text-sm truncate">
                      {thread.title}
                    </span>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(thread.id);
                          setEditingTitle(thread.title);
                        }}
                        className="p-1 hover:bg-muted-foreground/20 rounded"
                      >
                        <IconPencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteThread(thread.id, e)}
                        className="p-1 hover:bg-muted-foreground/20 rounded"
                      >
                        <IconTrash className="h-3 w-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
