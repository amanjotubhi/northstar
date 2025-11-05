export async function* streamOllama(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  model: string = "llama3.1:8b-instruct"
): AsyncGenerator<string, void, unknown> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || model;

  // Convert messages to Ollama format
  // Ollama chat API expects messages array with role and content
  const systemMessages = messages.filter((m) => m.role === "system");
  const conversationMessages = messages.filter((m) => m.role !== "system");

  // Combine system messages into the first user message or use as context
  const ollamaMessages: Array<{ role: "user" | "assistant"; content: string }> = [];

  if (systemMessages.length > 0) {
    // Prepend system message as first user message with instruction
    ollamaMessages.push({
      role: "user",
      content: systemMessages.map((m) => m.content).join("\n\n"),
    });
  }

  // Add conversation messages
  for (const msg of conversationMessages) {
    if (msg.role === "user" || msg.role === "assistant") {
      ollamaMessages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ollamaModel,
      messages: ollamaMessages,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body from Ollama");
  }

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        if (data.message?.content) {
          yield data.message.content;
        }
        if (data.done) {
          return;
        }
      } catch (e) {
        // Skip invalid JSON lines
        continue;
      }
    }
  }
}
