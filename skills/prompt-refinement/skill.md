---
name: prompt-refinement
description: Pre-process vague prompts through a local LLM to create structured tickets before sending to coding agents. Reduces token usage by 60-75%.
version: 1.0.0
author: sekaijinlimited
tags: [optimization, prompts, tokens, local-ai]
---

# Prompt Refinement Skill

## When to Use
- User gives a vague or ambiguous coding request
- Task needs clear acceptance criteria before implementation
- You want to minimize token usage on the coding agent

## How It Works
1. Intercept the raw user prompt
2. Pass it through a local LLM via promptfit (Ollama)
3. Receive a structured ticket with acceptance criteria
4. Execute against the structured spec instead of the vague prompt

## Setup
```bash
npm install -g promptfit
ollama pull qwen3:8b
```

## Usage
```bash
# CLI
pf 'your vague request' | claude -p

# Or as a slash command in Claude Code
/refine your vague request

# With file context
pf 'fix the nav' --context src/components/Nav.tsx | claude -p
```

## Token Savings
| Prompt Type | Without Refinement | With Refinement | Savings |
|---|---|---|---|
| Vague bug fix | ~3,000 tokens | ~800 tokens | 73% |
| Feature request | ~4,500 tokens | ~1,200 tokens | 73% |
| Refactoring | ~5,000 tokens | ~1,500 tokens | 70% |

## Configuration
- Default model: qwen3:8b (works on 8GB RAM)
- API: localhost:11434 (Ollama)
- Supports any OpenAI-compatible API as fallback
