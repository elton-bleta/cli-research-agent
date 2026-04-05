# CLI Research Agent

A TypeScript CLI tool that acts as a research assistant. It takes a question, decides whether to search the web or answer from its training knowledge, fetches results via Tavily, and synthesizes a cited answer — all powered by OpenAI's `gpt-4o-mini` with function calling.

Built as **Stage 1** of learning AI agentic systems from scratch. No frameworks — just the raw OpenAI SDK tool use loop.

---

## How It Works

```
User question
     ↓
GPT decides: answer from memory OR call web_search tool
     ↓ (if search needed)
Tavily API fetches results → returned to GPT
     ↓
GPT synthesizes answer + cites sources
     ↓
Printed to terminal
```

The core is a `while(true)` agent loop in `src/agent.ts`. GPT never calls functions directly — it outputs a `tool_use` block describing what it wants, you execute it, feed the result back, and loop until `finish_reason === "stop"`.

---

## Project Structure

```
cli-research-agent/
├── src/
│   ├── index.ts          # Entry point — reads CLI arg, prints result
│   ├── agent.ts          # The agent loop (core logic)
│   ├── tools/
│   │   └── search.ts     # Tavily tool definition + executor
│   └── types.ts          # TypeScript interfaces
├── .env                  # API keys (not committed)
├── tsconfig.json
└── package.json
```

---

## Prerequisites

- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)
- A [Tavily API key](https://tavily.com) (free tier available)

---

## Setup

**1. Clone and install dependencies**

```bash
git clone https://github.com/your-username/cli-research-agent.git
cd cli-research-agent
npm install
```

**2. Create a `.env` file in the project root**

```
OPENAI_API_KEY=your_openai_key_here
TAVILY_API_KEY=your_tavily_key_here
```

**3. Run**

```bash
npm start -- "your question here"
```

---

## Usage Examples

**Triggers web search** — recent events, specific facts, time-sensitive info:

```bash
npm start -- "What are the latest AI news this week?"
npm start -- "What are the newest features in TypeScript 5.5?"
```

**Answers from memory** — general knowledge, concepts, reasoning:

```bash
npm start -- "Explain the difference between var, let and const in JavaScript"
npm start -- "What is the ReAct pattern in AI agents?"
```

**Example output:**

```
❓ Question: What are the latest AI news this week?
──────────────────────────────────────────────────────

🤔 Thinking...

🔍 Searching: "latest AI news this week 2024"
✅ Found 5 results

──────────────────────────────────────────────────────

📋 Answer:

This week in AI...
[synthesized answer]

Sources:
- [Article Title](https://...)

🔗 Sources retrieved:
  • Article Title: https://...
```

---

## Key Concepts Learned

| Concept | Where it lives |
|---|---|
| Tool definition | `searchToolDefinition` in `search.ts` |
| Tool execution | `executeSearch()` — you control this, not GPT |
| Agent loop | `while(true)` in `agent.ts` |
| Stop condition | `finish_reason === "stop"` |
| Message history | `messages[]` array — the full conversation |
| Tool result injection | `tool_result` block pushed back into messages |

---

## Stack

- **Runtime:** Node.js + TypeScript (strict mode)
- **LLM:** OpenAI `gpt-4o-mini` via `openai` SDK
- **Search:** Tavily Search API
- **Config:** `dotenv`

---

## Part of a Learning Series

This project is **Stage 1** of a hands-on AI agentic systems roadmap:

| Stage | Topic | Status |
|---|---|---|
| 01 | Foundations — raw tool use loop | ✅ This project |
| 02 | Memory & State — vector stores, embeddings | 🔜 |
| 03 | Planning & Reasoning — task decomposition | 🔜 |
| 04 | Frameworks — LangChain.js, LangGraph.js | 🔜 |
| 05 | Multi-Agent Systems — orchestration | 🔜 |
| 06 | Production — observability, evals, RAG | 🔜 |

---

## License

MIT
