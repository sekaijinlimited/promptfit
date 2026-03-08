import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";

export async function readContextFiles(paths: string[]): Promise<string> {
  const sections: string[] = [];

  for (const filePath of paths) {
    try {
      const content = await readFile(filePath, "utf-8");
      const ext = extname(filePath).slice(1) || "txt";
      sections.push(`### ${basename(filePath)}\n\`\`\`${ext}\n${truncate(content, 3000)}\n\`\`\``);
    } catch {
      sections.push(`### ${basename(filePath)}\n(Could not read file)`);
    }
  }

  return sections.join("\n\n");
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n// ... truncated";
}
