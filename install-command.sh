#!/bin/bash
# Install promptfit as a Claude Code slash command
COMMANDS_DIR=".claude/commands"
mkdir -p "$COMMANDS_DIR"
cp "$(dirname "$0")/commands/refine.md" "$COMMANDS_DIR/refine.md"
echo '✅ Installed /refine command. Use it in Claude Code: /refine <your request>'
