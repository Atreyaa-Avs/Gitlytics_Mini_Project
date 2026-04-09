"use client";

import { useChatContext } from "@/components/ChatProvider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ChatSettings() {
  const { apiKey, setApiKey, model, setModel, provider, setProvider, approveAllTools, setApproveAllTools } =
    useChatContext();

  // Model options based on provider
  const modelOptions = provider === "groq"
    ? [
        { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
        { value: "llama-3.1-70b-versatile", label: "Llama 3.1 70B" },
        { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B" },
        { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
      ]
    : [
        { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
        { value: "gemini-2.0-flash-thinking-exp-1219", label: "Gemini 2.0 Flash Thinking" },
        { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
        { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
      ];

  // Update model when provider changes
  const handleProviderChange = (newProvider: "google" | "groq") => {
    setProvider(newProvider);
    // Set default model for the new provider
    if (newProvider === "groq") {
      setModel("llama-3.3-70b-versatile");
    } else {
      setModel("gemini-2.5-flash");
    }
  };

  return (
    <div className="space-y-4 p-3 bg-muted/50 rounded-lg">
      <div>
        <Label htmlFor="provider">AI Provider</Label>
        <Select value={provider} onValueChange={handleProviderChange}>
          <SelectTrigger id="provider" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google">Google Gemini</SelectItem>
            <SelectItem value="groq">Groq</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="api-key">{provider === "groq" ? "Groq" : "Google"} API Key</Label>
        <Input
          id="api-key"
          type="password"
          placeholder={`Enter your ${provider === "groq" ? "Groq" : "Google"} API key`}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Your API key is stored locally and only sent to {provider === "groq" ? "Groq" : "Google"}.
        </p>
      </div>

      <div>
        <Label htmlFor="model">Model</Label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger id="model" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {modelOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="approve-tools">Auto-approve Tools</Label>
          <p className="text-xs text-muted-foreground">
            Skip confirmation when the AI uses tools
          </p>
        </div>
        <Switch
          id="approve-tools"
          checked={approveAllTools}
          onCheckedChange={setApproveAllTools}
        />
      </div>
    </div>
  );
}
