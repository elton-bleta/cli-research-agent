export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface SearchToolInput {
  query: string;
  max_results?: number;
}

export interface AgentResponse {
  answer: string;
  sources: Array<{ title: string; url: string }>;
  usedWebSearch: boolean;
}
