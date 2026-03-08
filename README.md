# promptfit

**Turn vague requests into structured tickets for coding agents.**

Stop burning tokens on ambiguous prompts. `promptfit` uses a local LLM to transform one-liner requests into structured, actionable tickets — then pipes them to Claude Code, Codex, or any coding agent.

```bash
pf 'fix the login button on mobile' | claude -p
```

## Why

Coding agents waste tokens figuring out what you mean. A vague prompt like *"fix the login button on mobile"* forces the agent into a 3,000+ token reasoning loop just to understand the task. A structured ticket gets it done in ~800 tokens.

| | Vague Prompt | Structured Ticket |
|---|---|---|
| **Agent thinking tokens** | ~3,000 | ~800 |
| **Accuracy** | Hit or miss | Targeted |
| **Cost per task (GPT-4o)** | ~$0.09 | ~$0.024 |
| **Local refinement cost** | — | $0.00 |

**Refinement happens locally** (Ollama) — so structuring is free. You save tokens on every downstream agent call.

## Install

```bash
npm install -g promptfit
```

Requires [Ollama](https://ollama.com) running locally (or any OpenAI-compatible API).

```bash
# Start Ollama
ollama serve

# Pull a recommended model
ollama pull qwen3:8b
```

## Quick Start

```bash
# Refine a prompt
pf 'fix the login button on mobile'

# Pipe directly to Claude Code
pf 'add dark mode to settings page' | claude -p

# Include file context for smarter tickets
pf 'fix the nav dropdown' --context src/components/Nav.tsx
```

## Usage

```
Usage: pf [options] [prompt...]

Turn vague requests into structured tickets for coding agents

Options:
  -V, --version          output the version number
  -c, --context <files>  files to include as context
  -m, --model <model>    LLM model to use (default: "qwen3:8b")
  --api-url <url>        LLM API base URL (default: "http://localhost:11434")
  --api-key <key>        API key (for OpenAI-compatible APIs)
  --json                 output as JSON instead of markdown
  -i, --interactive      ask clarifying questions before generating
  -h, --help             display help for command
```

### Examples

```bash
# Basic refinement
pf 'fix the login button on mobile'

# With file context
pf 'refactor the auth flow' --context src/auth.ts src/middleware.ts

# Use a specific model
pf 'add pagination' --model llama3.1:8b

# Cloud API fallback
pf 'fix login' --api-url https://api.openai.com/v1 --api-key sk-xxx --model gpt-4o-mini

# JSON output (for integrations)
pf 'fix login' --json

# Interactive mode — asks clarifying questions first
pf 'fix login' -i

# Read prompt from stdin
echo 'add search to the dashboard' | pf

# Full pipeline: refine → execute
pf 'add rate limiting to the API' --context src/routes/ | claude -p
```

### Output Format

```markdown
## Task: Fix mobile login button not responding to taps

### Current State
- Login button exists but is unresponsive on mobile viewports
- Likely a touch target size or z-index issue

### Expected Behavior
- Login button responds to taps on all mobile devices
- Touch target meets 44x44px minimum accessibility guideline

### Acceptance Criteria
- [ ] Button responds to tap on iOS Safari and Chrome Android
- [ ] Touch target is at least 44x44px
- [ ] No overlapping elements blocking the button
- [ ] Works in both portrait and landscape orientation

### Technical Context
- Component: src/components/LoginButton.tsx
- Likely CSS issue — check z-index stacking and padding

### Implementation Notes
- Check for overlapping elements with higher z-index
- Verify min-height/min-width on the button or its container
- Test with Chrome DevTools device emulation
```

## Configuration

All options can be set via CLI flags. No config file needed.

| Flag | Default | Description |
|---|---|---|
| `--model` | `qwen3:8b` | Ollama model name |
| `--api-url` | `http://localhost:11434` | LLM API endpoint |
| `--api-key` | — | API key for cloud APIs |
| `--context` | — | Files to include as context |
| `--json` | `false` | JSON output mode |
| `-i` | `false` | Interactive mode |

## How It Works

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Vague prompt    │────▶│  Local LLM   │────▶│  Structured     │
│  "fix login btn" │     │  (Ollama)    │     │  ticket.md      │
└─────────────────┘     └──────────────┘     └────────┬────────┘
                                                      │
       ┌──────────────────────────────────────────────┘
       ▼
┌─────────────────┐     ┌──────────────┐
│  Coding agent   │────▶│  Clean code  │
│  (Claude Code)  │     │  changes     │
└─────────────────┘     └──────────────┘
```

1. You type a vague request
2. `pf` sends it to a local LLM (free, private, fast)
3. The LLM structures it into a detailed ticket with acceptance criteria
4. The ticket is piped to your coding agent, which executes with precision

## Claude Code Integration

Use `promptfit` as a native slash command inside Claude Code.

### Install

```bash
# One-liner: install CLI + slash command
npm install -g promptfit && bash <(curl -s https://raw.githubusercontent.com/user/promptfit/main/install-command.sh)

# Or manually
cp commands/refine.md .claude/commands/refine.md
```

### Usage

In Claude Code, type:

```
/refine fix the login button on mobile
```

Claude Code will:
1. Run `pf` with your prompt to generate a structured ticket
2. Use the ticket as the implementation specification
3. Implement the task following the acceptance criteria

### ECC Compatibility

`promptfit` ships as an [ECC](https://github.com/anthropics/ecc)-compatible skill. The slash command lives in `commands/refine.md` and the skill definition is in `skills/prompt-refinement/skill.md`.

## Supported Models

Any Ollama model works. Recommended:

| Model | Size | Speed | Quality |
|---|---|---|---|
| `qwen3:8b` | 4.9 GB | Fast | Great (default) |
| `qwen3:14b` | 9.0 GB | Medium | Excellent |
| `llama3.1:8b` | 4.7 GB | Fast | Good |
| `gemma3:12b` | 8.1 GB | Medium | Great |
| `mistral:7b` | 4.1 GB | Fast | Good |

```bash
ollama pull qwen3:8b    # Recommended default
```

## Monetization: modelfit.io

`promptfit` is the open-source CLI. **[modelfit.io](https://modelfit.io)** is the SaaS layer:

- **Team prompt libraries** — share structured templates across your org
- **Analytics** — track token savings, prompt quality scores, agent success rates
- **Cloud refinement** — no local GPU needed, fine-tuned models for higher quality
- **Integrations** — GitHub Actions, Slack, Linear, Jira ticket auto-refinement
- **Prompt versioning** — A/B test prompt structures, track what works

The CLI stays free forever. The platform adds collaboration and scale.

## Contributing

```bash
git clone https://github.com/user/promptfit.git
cd promptfit
npm install
npm run build
node dist/cli.js 'test prompt'
```

PRs welcome. Keep it minimal — the whole tool is under 500 lines.

## License

MIT
