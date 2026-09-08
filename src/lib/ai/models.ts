import { anthropic } from "@ai-sdk/anthropic";

// Direct Anthropic API — called with our own ANTHROPIC_API_KEY, not routed
// through Vercel's AI Gateway. Anthropic's DPA (with SCCs for the EU) is
// automatically part of their Commercial API Terms for any account, unlike
// the Gateway's DPA, which only applies on Vercel's paid plans. See
// WeddingsStuff for Claude/weddingsforone-migration-direct-anthropic-api.md.
export const CHAT_MODEL = anthropic("claude-sonnet-5");
export const FAST_MODEL = anthropic("claude-haiku-4-5-20251001");
