import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function* streamAnthropic(
  messages: Anthropic.Messages.MessageParam[],
  systemPrompt: string
): AsyncGenerator<string, void, unknown> {
  const stream = await anthropic.messages.stream({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    system: systemPrompt,
    messages,
  });

  for await (const chunk of stream) {
    if (chunk.type === "content_block_delta") {
      if (chunk.delta.type === "text_delta") {
        yield chunk.delta.text;
      }
    }
  }
}
