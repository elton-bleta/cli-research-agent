import fetch from "node-fetch";
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import type { SearchResult, SearchToolInput } from "../types";

// OpenAI wraps the definition inside a "function" object
export const searchToolDefinition: ChatCompletionTool = {
  type: "function",
  function: {
    name: "web_search",
    description: `Search the web for current information.
      Use this when: the question involves recent events, specific facts you might
      not know, current prices, news, or anything time-sensitive.
      Do NOT use for general knowledge, math, definitions, or reasoning tasks.`,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            'The search query. Be specific. E.g. "TypeScript 5.5 new features 2024"',
        },
        max_results: {
          type: "number",
          description: "Number of results to return. Default 5, max 10.",
        },
      },
      required: ["query"],
    },
  },
};

// Identical to the Anthropic version — Tavily doesn't care which LLM you use
export async function executeSearch(
  input: SearchToolInput,
): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY is not set");

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query: input.query,
      max_results: input.max_results ?? 5,
      search_depth: "basic",
      include_answer: false,
      include_raw_content: false,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Tavily API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as { results: SearchResult[] };
  return data.results;
}
