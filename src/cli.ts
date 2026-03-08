#!/usr/bin/env node

import { Command } from "commander";
import { createInterface } from "node:readline";
import { refine } from "./refiner.js";

const DEFAULT_API_URL = "http://localhost:11434";
const DEFAULT_MODEL = "qwen3:8b";

const program = new Command();

program
  .name("pf")
  .description("Turn vague requests into structured tickets for coding agents")
  .version("1.0.0")
  .argument("[prompt...]", "The vague prompt to refine")
  .option("-c, --context <files...>", "Files to include as context")
  .option("-m, --model <model>", "LLM model to use", DEFAULT_MODEL)
  .option("--api-url <url>", "LLM API base URL", DEFAULT_API_URL)
  .option("--api-key <key>", "API key (for OpenAI-compatible APIs)")
  .option("--json", "Output as JSON instead of markdown")
  .option("-i, --interactive", "Ask clarifying questions before generating")
  .action(async (promptWords: string[], opts) => {
    const prompt = promptWords.join(" ");

    if (!prompt) {
      // Read from stdin if no prompt argument
      const stdin = await readStdin();
      if (!stdin) {
        program.help();
        return;
      }
      await run(stdin, opts);
      return;
    }

    await run(prompt, opts);
  });

interface CLIOptions {
  context?: string[];
  model: string;
  apiUrl: string;
  apiKey?: string;
  json?: boolean;
  interactive?: boolean;
}

async function run(prompt: string, opts: CLIOptions): Promise<void> {
  const isTTY = process.stderr.isTTY;

  if (isTTY) {
    process.stderr.write("Refining prompt...\n");
  }

  try {
    const result = await refine({
      prompt,
      contextFiles: opts.context,
      interactive: opts.interactive,
      json: opts.json,
      llm: {
        apiUrl: opts.apiUrl,
        apiKey: opts.apiKey,
        model: opts.model,
      },
    });

    if (opts.interactive && !opts.json) {
      process.stdout.write(result + "\n");

      const answer = await askUser("\nAnswer the questions above (or press Enter to skip): ");
      if (answer.trim()) {
        if (isTTY) {
          process.stderr.write("Generating final ticket...\n");
        }

        const finalResult = await refine({
          prompt: `Original request: ${prompt}\n\nClarifications: ${answer}`,
          contextFiles: opts.context,
          json: opts.json,
          llm: {
            apiUrl: opts.apiUrl,
            apiKey: opts.apiKey,
            model: opts.model,
          },
        });

        process.stdout.write(finalResult + "\n");
      }
    } else {
      process.stdout.write(result + "\n");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) {
      process.stderr.write(
        `Error: Cannot connect to LLM at ${opts.apiUrl}\n` +
          "Make sure Ollama is running: ollama serve\n",
      );
    } else {
      process.stderr.write(`Error: ${message}\n`);
    }

    process.exit(1);
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve("");
      return;
    }

    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data.trim()));
  });
}

function askUser(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

program.parse();
