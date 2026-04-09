import { DEFAULT_SYSTEM_PROMPT as SYSTEM_PROMPT } from "./prompt";
import { postgresCheckpointer } from "./memory";
import type { DynamicTool, StructuredToolInterface } from "@langchain/core/tools";
import {
  AgentConfigOptions,
  createChatModel,
  DEFAULT_MODEL_NAME,
  DEFAULT_MODEL_PROVIDER,
} from "./util";
import { getMCPTools } from "./mcp";
import { AgentBuilder } from "./builder";

let setupPromise: Promise<void> | null = null;

async function setupOnce() {
  if (!setupPromise) {
    setupPromise = postgresCheckpointer.setup().catch((err) => {
      setupPromise = null;
      console.error("Failed to setup postgres checkpointer:", err);
      throw err;
    });
  }
  await setupPromise;
}

async function createAgent(cfg?: AgentConfigOptions & { userId?: string }) {
  const provider = cfg?.provider || DEFAULT_MODEL_PROVIDER;
  const modelName = cfg?.model || DEFAULT_MODEL_NAME;
  const llm = createChatModel({
    provider,
    model: modelName,
    temperature: 0.7,
    apiKey: cfg?.apiKey,
  });

  const userId = cfg?.userId || "";
  const mcpTools = userId ? await getMCPTools(userId) : [];
  const configTools = (cfg?.tools || []) as StructuredToolInterface[];
  const allTools = [...configTools, ...mcpTools] as DynamicTool[];

  const agent = new AgentBuilder({
    llm,
    tools: allTools,
    prompt: cfg?.systemPrompt || SYSTEM_PROMPT,
    checkpointer: postgresCheckpointer,
    approveAllTools: cfg?.approveAllTools || false,
  }).build();

  return agent;
}

export async function ensureAgent(cfg?: AgentConfigOptions & { userId?: string }) {
  await setupOnce();
  return createAgent(cfg);
}

export async function getAgent(cfg?: AgentConfigOptions & { userId?: string }) {
  return ensureAgent(cfg);
}
