import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function* streamOpenAI(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): AsyncGenerator<string, void, unknown> {
  const stream = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      yield content;
    }
  }
}
