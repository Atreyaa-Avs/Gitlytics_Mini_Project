"use client";

import { useChatContext } from "@/components/ChatProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IconSparkles } from "@tabler/icons-react";

// Model definitions with metadata
const modelConfig = {
  google: {
    label: "Google",
    models: [
      { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", badge: "Fast" },
      { value: "gemini-2.0-flash-thinking-exp-1219", label: "Gemini 2.0 Flash Thinking", badge: "Thinking" },
      { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite", badge: "Lite" },
      { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", badge: "Pro" },
    ],
  },
  groq: {
    label: "Groq",
    models: [
      { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", badge: "Fast" },
      { value: "llama-3.1-70b-versatile", label: "Llama 3.1 70B", badge: "" },
      { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B", badge: "Instant" },
      { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B", badge: "" },
    ],
  },
};

export function ModelSelector() {
  const { model, setModel, provider, setProvider } = useChatContext();

  const handleProviderChange = (newProvider: string) => {
    const prov = newProvider as "google" | "groq";
    setProvider(prov);
    // Auto-select the first model of the new provider
    const firstModel = modelConfig[prov].models[0].value;
    setModel(firstModel);
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
  };

  // Find current model info
  const currentModels = modelConfig[provider].models;
  const currentModelInfo = currentModels.find((m) => m.value === model);

  return (
    <div className="flex items-center gap-2">
      {/* Provider Selector */}
      <Select value={provider} onValueChange={handleProviderChange}>
        <SelectTrigger className="w-[110px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="google">Google</SelectItem>
          <SelectItem value="groq">Groq</SelectItem>
        </SelectContent>
      </Select>

      {/* Model Selector */}
      <Select value={model} onValueChange={handleModelChange}>
        <SelectTrigger className="w-fit h-8 text-xs">
          <div className="flex items-center gap-1.5">
            <IconSparkles className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue />
            
          </div>
        </SelectTrigger>
        <SelectContent>
          {currentModels.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              <div className="flex items-center justify-between w-full gap-2">
                <span>{m.label}</span>
                {m.badge && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {m.badge}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
