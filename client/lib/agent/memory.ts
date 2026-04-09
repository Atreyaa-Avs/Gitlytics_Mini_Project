import { BaseMessage } from "@langchain/core/messages";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

/**
 * Creates a PostgresSaver instance using the DATABASE_URL environment variable.
 */
export function createPostgresMemory(): PostgresSaver {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required for LangGraph checkpointing");
  }
  return PostgresSaver.fromConnString(connectionString);
}

/**
 * Retrieves the message history for a specific thread.
 */
export const getHistory = async (threadId: string): Promise<BaseMessage[]> => {
  const history = await postgresCheckpointer.get({
    configurable: { thread_id: threadId },
  });
  return Array.isArray(history?.channel_values?.messages) ? history.channel_values.messages : [];
};

let _checkpointer: PostgresSaver | null = null;

export const postgresCheckpointer: PostgresSaver = (() => {
  if (!_checkpointer) {
    _checkpointer = createPostgresMemory();
  }
  return _checkpointer;
})();
