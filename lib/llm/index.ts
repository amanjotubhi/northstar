import { streamAnthropic } from "./providers/anthropic";
import { streamOpenAI } from "./providers/openai";
import { streamOllama } from "./providers/ollama";

export type LLMProvider = "anthropic" | "openai" | "ollama";

export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export function getLLMProvider(): LLMProvider {
  const envProvider = process.env.LLM_PROVIDER as LLMProvider;
  if (envProvider === "anthropic" || envProvider === "openai" || envProvider === "ollama") {
    return envProvider;
  }

  // Default logic: prefer Anthropic if key is set, else OpenAI, else Ollama
  if (process.env.ANTHROPIC_API_KEY) {
    return "anthropic";
  }
  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }
  if (process.env.OLLAMA_MODEL || process.env.OLLAMA_URL) {
    return "ollama";
  }

  return "anthropic"; // Default fallback
}

export async function* chatLLM(
  messages: LLMMessage[],
  systemPrompt: string
): AsyncGenerator<string, void, unknown> {
  const provider = getLLMProvider();

  if (provider === "anthropic") {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }

    const anthropicMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })) as Array<{ role: "user" | "assistant"; content: string }>;

    yield* streamAnthropic(anthropicMessages, systemPrompt);
  } else if (provider === "ollama") {
    const ollamaModel = process.env.OLLAMA_MODEL || "llama3.1:8b-instruct";
    
    // Combine system prompt with messages for Ollama
    const allMessages: LLMMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    yield* streamOllama(allMessages, ollamaModel);
  } else {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const openaiMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    })) as Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }>;

    // OpenAI includes system in messages array
    const allMessages = [
      { role: "system" as const, content: systemPrompt },
      ...openaiMessages.filter((m) => m.role !== "system"),
    ];

    yield* streamOpenAI(allMessages);
  }
}

export function createStreamResponse(
  stream: AsyncGenerator<string, void, unknown>
): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
