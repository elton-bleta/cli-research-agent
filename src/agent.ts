import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionAssistantMessageParam,
  ChatCompletionToolMessageParam,
} from "openai/resources/chat/completions";
import { searchToolDefinition, executeSearch } from "./tools/search";
import type { AgentResponse, SearchResult, SearchToolInput } from "./types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a research assistant that answers questions accurately.

When you need current information, recent events, or specific facts — use the web_search tool.
When you can answer confidently from your training knowledge — answer directly without searching.

After searching, synthesize the results into a clear, direct answer.
Always cite your sources at the end using this format:

Sources:
- [Title](URL)

Be concise. Lead with the answer, then supporting details.`;

export async function runAgent(question: string): Promise<AgentResponse> {
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: question },
  ];
  // Note: OpenAI takes system prompt inside messages[],
  // Anthropic took it as a separate `system` param

  let usedWebSearch = false;
  const collectedSources: Array<{ title: string; url: string }> = [];

  console.log("\n🤔 Thinking...\n");

  while (true) {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      tools: [searchToolDefinition],
      messages,
    });

    const choice = response.choices[0];

    // Model finished — no more tool calls
    if (choice.finish_reason === "stop") {
      return {
        answer: choice.message.content ?? "No answer generated.",
        sources: collectedSources,
        usedWebSearch,
      };
    }

    // Model wants to call a tool
    if (choice.finish_reason === "tool_calls") {
      const toolCalls = choice.message.tool_calls;
      if (!toolCalls) break;

      // Add assistant's message (with its tool_calls) to history
      // OpenAI requires the full assistant message object here, not just content
      const assistantMessage: ChatCompletionAssistantMessageParam = {
        role: "assistant",
        content: choice.message.content, // may be null, that's fine
        tool_calls: toolCalls,
      };
      messages.push(assistantMessage);

      // Execute each tool call and push results back individually
      // OpenAI wants one tool message per tool call (unlike Anthropic which batches them)
      for (const toolCall of toolCalls) {
        if (toolCall.type !== "function") continue; // skip non-function tool calls (e.g. "search" tool calls)
        if (toolCall.function.name === "web_search") {
          // OpenAI sends arguments as a JSON string — you must parse it
          const input = JSON.parse(
            toolCall.function.arguments,
          ) as SearchToolInput;
          console.log(`🔍 Searching: "${input.query}"`);

          let toolResultContent: string;

          try {
            const results: SearchResult[] = await executeSearch(input);
            usedWebSearch = true;

            results.forEach((r) => {
              if (!collectedSources.find((s) => s.url === r.url)) {
                collectedSources.push({ title: r.title, url: r.url });
              }
            });

            toolResultContent = results
              .map(
                (r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}`,
              )
              .join("\n\n");

            console.log(`✅ Found ${results.length} results\n`);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Search failed";
            console.error(`❌ Search error: ${errorMessage}`);
            toolResultContent = `Search failed: ${errorMessage}. Answer from your training knowledge instead.`;
          }

          // Each tool result needs to reference the tool_call_id it belongs to
          // This is how OpenAI matches results back to the right tool call
          const toolMessage: ChatCompletionToolMessageParam = {
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResultContent,
          };
          messages.push(toolMessage);
        }
      }
      // Loop continues — model reads the tool results and either answers or searches again
    }
  }

  return {
    answer: "Agent loop ended unexpectedly.",
    sources: collectedSources,
    usedWebSearch,
  };
}
