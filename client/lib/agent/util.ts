import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { DynamicStructuredTool, DynamicTool } from "@langchain/core/tools";

export interface CreateChatModelOptions {
  provider?: string;
  model: string;
  temperature?: number;
  apiKey?: string;
}

/**
 * Central factory for creating a chat model based on provider + model name.
 * Currently supports Google Gemini only.
 */
export function createChatModel({
  provider = "google",
  model,
  temperature = 0.7,
  apiKey,
}: CreateChatModelOptions): BaseChatModel {
  switch (provider) {
    case "google":
    default:
      return new ChatGoogleGenerativeAI({
        model,
        temperature,
        apiKey: apiKey || process.env.GOOGLE_API_KEY,
      });
  }
}

export interface AgentConfigOptions {
  model?: string;
  provider?: string;
  systemPrompt?: string;
  tools?: unknown[];
  approveAllTools?: boolean;
  apiKey?: string;
}

/**
 * JSON Schema keywords that are not supported by Google Gemini's function calling API.
 */
const UNSUPPORTED_SCHEMA_KEYWORDS = new Set([
  "$schema",
  "$id",
  "$ref",
  "$defs",
  "definitions",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "multipleOf",
  "minLength",
  "maxLength",
  "pattern",
  "minItems",
  "maxItems",
  "uniqueItems",
  "minProperties",
  "maxProperties",
  "additionalProperties",
  "patternProperties",
  "allOf",
  "anyOf",
  "oneOf",
  "not",
  "if",
  "then",
  "else",
  "contentMediaType",
  "contentEncoding",
  "examples",
  "default",
  "const",
  "readOnly",
  "writeOnly",
  "deprecated",
  "title",
  "format",
]);

function normalizeType(type: unknown): string | undefined {
  if (typeof type === "string") {
    return type;
  }
  if (Array.isArray(type)) {
    const nonNullTypes = type.filter((t) => t !== "null");
    if (nonNullTypes.length > 0) {
      return nonNullTypes[0] as string;
    }
    return "string";
  }
  return undefined;
}

function sanitizeSchema(schema: unknown): Record<string, unknown> | unknown {
  if (!schema || typeof schema !== "object") {
    return schema;
  }
  if (Array.isArray(schema)) {
    return schema.map((item) => sanitizeSchema(item));
  }
  const schemaObj = schema as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(schemaObj)) {
    if (UNSUPPORTED_SCHEMA_KEYWORDS.has(key)) {
      continue;
    }
    if (key === "type") {
      const normalizedType = normalizeType(value);
      if (normalizedType) {
        sanitized[key] = normalizedType;
      }
      continue;
    }
    if (key === "items" && Array.isArray(value)) {
      if (value.length > 0) {
        sanitized[key] = sanitizeSchema(value[0]);
      }
      continue;
    }
    if (value && typeof value === "object") {
      sanitized[key] = sanitizeSchema(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function sanitizeTool(
  tool: DynamicStructuredTool,
): DynamicStructuredTool {
  const originalSchema = tool.schema as Record<string, unknown>;
  const sanitizedSchema = sanitizeSchema(originalSchema) as Record<
    string,
    unknown
  >;
  (tool as unknown as Record<string, unknown>).schema = sanitizedSchema;
  const lc_kwargs = (tool as unknown as Record<string, unknown>).lc_kwargs as
    | Record<string, unknown>
    | undefined;
  if (lc_kwargs?.schema) {
    lc_kwargs.schema = sanitizedSchema;
  }
  return tool;
}

export const DEFAULT_MODEL_PROVIDER = "google";
export const DEFAULT_MODEL_NAME = "gemini-2.0-flash";
