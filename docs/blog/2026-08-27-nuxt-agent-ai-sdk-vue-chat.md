---
title: 'Building a Nuxt Agent-style chat UI in Vue with AI SDK v6'
date: '2026-08-27'
tags: [vue, ai, nuxt, mcp]
summary: >-
  Nuxt shipped its own AI chat agent in Beta, built entirely on AI SDK v6, `@ai-sdk/vue`'s
  `useChat`, and a Nitro route that merges MCP tools with native ones — here's the reusable
  pattern underneath, stripped of the Nuxt-specific plumbing.
readTime: 6
---

# Building a Nuxt Agent-style chat UI in Vue with AI SDK v6

Nuxt shipped an AI chat agent on its own marketing site in Beta this year, and it's tempting to file that under "framework team plays with the hot new toy." The "Introducing the Nuxt Agent" post reads differently once you look past the demo: it's a working reference for exactly the kind of thing a lot of Vue teams keep half-building themselves — a chat UI that can call real tools, ground its answers in real docs, and not fall over the moment two teammates hit "send" at once. The interesting part isn't that Nuxt has a chatbot. It's that the whole thing collapses to `@ai-sdk/vue`'s `useChat` on the client and `streamText` on the server, with the framework-specific bits doing far less work than you'd expect.

## What's actually running behind nuxt.com's chat widget

Strip the marketing framing and the architecture is small. A single Nitro handler, `server/api/agent.post.ts`, does the heavy lifting: it receives the conversation, calls AI SDK v6's `streamText` against `claude-sonnet-4.6`, and streams `UIMessage` chunks back to the client. On the client side, a `Chat` instance from `@ai-sdk/vue` owns the message state and wires it to the composer.

The part worth studying is the tool layer. Nuxt's own docs, blog posts, module catalog, and changelog are already exposed through an MCP server — the same one Cursor, Claude Desktop, and ChatGPT connect to when someone points an assistant at Nuxt. Rather than duplicating that knowledge into a second retrieval pipeline, the agent handler opens an HTTP client back to its own `/mcp` endpoint via `createMCPClient`, and merges whatever tools that returns with a handful of native ones — `show_module`, `show_template`, `show_blog_post`, `open_playground` (which mints a StackBlitz link), `report_issue`, `search_github_issues`, and a `web_search` fallback. All of it lands in one `tools` object passed straight into `streamText`. The model doesn't know or care which tools came from MCP and which are hand-written; they're just tools.

That's a genuinely useful pattern independent of Nuxt: if you already run or consume an MCP server for anything — internal docs, a design system, a ticket tracker — you don't need a second integration layer to put that same knowledge behind a chat agent. You point `createMCPClient` at it and merge the result into your tool set.

*A staleness note, since this describes a Beta feature from an April 2026 post: exact function names and the MCP client API may have shifted since. Treat the architecture as the durable takeaway and verify current signatures against AI SDK's own docs before shipping.*

## The reusable skeleton, without the Nuxt-specific plumbing

Peel away the docs-specific tools and persistence, and what's left is a pattern any Vue app — Nuxt or not — can lift wholesale. On the client:

```vue
<script setup lang="ts">
import { useChat } from '@ai-sdk/vue'
import { ref } from 'vue'

const input = ref('')
const { messages, sendMessage } = useChat()
</script>

<template>
  <div v-for="(message, i) in messages" :key="message.id ?? i">
    <strong>{{ message.role === 'user' ? 'You' : 'Agent' }}:</strong>
    <span v-for="(part, j) in message.parts" :key="`${message.id}-${part.type}-${j}`">
      <template v-if="part.type === 'text'">{{ part.text }}</template>
    </span>
  </div>

  <form @submit.prevent="sendMessage({ text: input }); input = ''">
    <input v-model="input" />
  </form>
</template>
```

`useChat` hands back reactive `messages` — each one an array of typed `parts`, not a flat string, which is what lets a single message mix prose with a rendered tool-call card. `sendMessage` handles the round trip.

The server side is a plain Nitro (or any H3-based) route:

```ts
// server/api/chat.post.ts
import { streamText, convertToModelMessages, createUIMessageStreamResponse, toUIMessageStream } from 'ai'

export default defineEventHandler(async event => {
  const { messages } = await readBody(event)

  const result = streamText({
    model: /* your model of choice */,
    messages: await convertToModelMessages(messages),
    tools: { /* merge MCP + native tools here */ },
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
})
```

`convertToModelMessages` bridges the UI-shaped message history back to the model's expected format; `toUIMessageStream` does the reverse for the response. Everything Nuxt's agent adds on top — the MCP merge, persistence, rate limiting — slots into this same handler without touching the client at all.

## Two details worth stealing even if you skip the MCP part

Two choices in Nuxt's implementation aren't obvious until you've built an agentic chat loop yourself and hit the failure modes.

First: `streamText` in an agentic setup can keep calling tools indefinitely if the model decides it wants to. Nuxt's handler passes a custom `stopWhen` predicate that halts the loop once the model produces text without requesting another tool call, backed by a hard ceiling around ten steps. Without something like that, a model stuck re-querying the same tool burns latency and cost with no user-visible progress. Building that termination condition in from the start is cheaper than debugging a runaway loop in production.

Second: chat persistence happens via `event.waitUntil(saveChat(...))`, outside the request-response cycle rather than blocking on it. That matters more than it looks — a Nitro handler deployed to an edge runtime can return the streamed response to the client immediately while the save-to-database call finishes in the background, instead of making the user wait on a database round trip that has nothing to do with what they're waiting to read.

Neither of these needs Nuxt or MCP to be useful. They're just what an agent handler looks like once someone has run one in production long enough to hit rate limits and runaway tool loops.

## Why this is worth your attention now

The interesting shift here isn't "Nuxt has AI now" — it's that AI SDK v6 plus `@ai-sdk/vue` has gotten thin enough that a production-grade agent, tool-calling included, is a Nitro route and a composable rather than a bespoke orchestration layer. If you've been holding off on adding a chat surface to a Vue app because it felt like it'd require pulling in a heavier agent framework, Nuxt's own dogfood is a decent argument that it doesn't. Read the source pattern, not the demo — the demo is the least interesting part of it.

## Sources

- [Introducing the Nuxt Agent — Nuxt Blog](https://nuxt.com/blog/introducing-nuxt-agent)
- [Getting Started: Vue.js (Nuxt) — AI SDK](https://ai-sdk.dev/docs/getting-started/nuxt)
