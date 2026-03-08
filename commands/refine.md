# /refine — Structured Prompt Refinement

Before implementing anything from the user's request below, run this command to structure it into an actionable ticket:

```bash
pf '$ARGUMENTS'
```

Use the structured ticket output as your implementation specification. Follow the acceptance criteria exactly. Do not skip any criteria.

If pf is not installed, install it first:
```bash
npm install -g promptfit
```

If Ollama is not running or no model is available, fall back to structuring the ticket yourself using this format:
- Task title
- Current state
- Expected behavior
- Acceptance criteria (checkboxes)
- Technical context
- Implementation notes

Then implement the task.
