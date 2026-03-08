import { chatCompletion, type LLMOptions } from "./ollama.js";
import { readContextFiles } from "./context.js";
import { SYSTEM_PROMPT, CONTEXT_HEADER, INTERACTIVE_PROMPT } from "./templates.js";

export interface RefineOptions {
  prompt: string;
  contextFiles?: string[];
  interactive?: boolean;
  json?: boolean;
  llm: LLMOptions;
}

export async function refine(options: RefineOptions): Promise<string> {
  let systemPrompt = SYSTEM_PROMPT;
  let userMessage = options.prompt;

  if (options.interactive) {
    systemPrompt += "\n\n" + INTERACTIVE_PROMPT;
  }

  if (options.contextFiles?.length) {
    const contextContent = await readContextFiles(options.contextFiles);
    userMessage += CONTEXT_HEADER + contextContent;
  }

  const result = await chatCompletion(options.llm, systemPrompt, userMessage);

  if (options.json) {
    return JSON.stringify(parseTicket(result), null, 2);
  }

  return result;
}

interface Ticket {
  task: string;
  currentState: string[];
  expectedBehavior: string[];
  acceptanceCriteria: string[];
  technicalContext: string[];
  implementationNotes: string[];
  raw: string;
}

function parseTicket(markdown: string): Ticket {
  const ticket: Ticket = {
    task: "",
    currentState: [],
    expectedBehavior: [],
    acceptanceCriteria: [],
    technicalContext: [],
    implementationNotes: [],
    raw: markdown,
  };

  const taskMatch = markdown.match(/^## Task:\s*(.+)$/m);
  if (taskMatch) ticket.task = taskMatch[1].trim();

  ticket.currentState = extractBullets(markdown, "Current State");
  ticket.expectedBehavior = extractBullets(markdown, "Expected Behavior");
  ticket.acceptanceCriteria = extractBullets(markdown, "Acceptance Criteria");
  ticket.technicalContext = extractBullets(markdown, "Technical Context");
  ticket.implementationNotes = extractBullets(markdown, "Implementation Notes");

  return ticket;
}

function extractBullets(markdown: string, section: string): string[] {
  const regex = new RegExp(
    `###\\s+${section}\\s*\\n([\\s\\S]*?)(?=###|$)`,
  );
  const match = markdown.match(regex);
  if (!match) return [];

  return match[1]
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*(\[.\]\s*)?/, "").trim())
    .filter(Boolean);
}
