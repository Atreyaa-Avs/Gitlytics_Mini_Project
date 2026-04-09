"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IconPlug, IconTrash, IconPencil, IconX, IconCheck } from "@tabler/icons-react";

interface MCPServer {
  id: string;
  name: string;
  type: "stdio" | "http";
  enabled: boolean;
  command?: string;
  url?: string;
}

export function MCPServerConfig() {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "stdio" as "stdio" | "http",
    command: "",
    url: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchServers();
    }
  }, [isOpen]);

  const fetchServers = async () => {
    try {
      const response = await fetch("/api/mcp-servers");
      if (response.ok) {
        const data = await response.json();
        setServers(data);
      }
    } catch (error) {
      console.error("Failed to fetch MCP servers:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/mcp-servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setShowForm(false);
        setFormData({ name: "", type: "stdio", command: "", url: "" });
        await fetchServers();
      }
    } catch (error) {
      console.error("Failed to create MCP server:", error);
    }
  };

  const toggleEnabled = async (server: MCPServer) => {
    try {
      const response = await fetch("/api/mcp-servers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: server.id, enabled: !server.enabled }),
      });
      if (response.ok) {
        await fetchServers();
      }
    } catch (error) {
      console.error("Failed to toggle server:", error);
    }
  };

  const deleteServer = async (id: string) => {
    try {
      const response = await fetch(`/api/mcp-servers?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchServers();
      }
    } catch (error) {
      console.error("Failed to delete server:", error);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-xs"
      >
        <IconPlug className="h-3 w-3 mr-1" />
        MCP Servers
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">MCP Server Configuration</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <IconX className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Server Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "stdio" | "http",
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="stdio">STDIO (Local)</option>
                  <option value="http">HTTP (Remote)</option>
                </select>
              </div>

              {formData.type === "stdio" ? (
                <div>
                  <label className="text-sm font-medium">Command</label>
                  <input
                    type="text"
                    value={formData.command}
                    onChange={(e) =>
                      setFormData({ ...formData, command: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="npx"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium">URL</label>
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="http://localhost:3001/mcp"
                    required
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">
                  <IconCheck className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <Button onClick={() => setShowForm(true)}>
                <IconPlug className="h-4 w-4 mr-1" />
                Add MCP Server
              </Button>

              <div className="space-y-2">
                {servers.map((server) => (
                  <div
                    key={server.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{server.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {server.type} • {server.command || server.url}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleEnabled(server)}
                        className={`px-2 py-1 text-xs rounded ${
                          server.enabled
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {server.enabled ? "Enabled" : "Disabled"}
                      </button>
                      <button
                        onClick={() => deleteServer(server.id)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
