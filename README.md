# clarion

Chat room-based messaging MCP server for inter-session communication in Claude Code.

Multiple Claude Code sessions (terminals) can join chat rooms and exchange messages. Each session can set a unique name and role per room, guiding how it thinks, requests, and responds.

[한국어 문서](./README.ko.md)

## Installation

```bash
npx -y @baebyeongil/clarion
```

## Register with Claude Code

```bash
claude mcp add clarion --scope user --transport stdio -- npx -y @baebyeongil/clarion
```

Or add directly to `~/.claude.json`:

```json
{
  "mcpServers": {
    "clarion": {
      "command": "npx",
      "args": ["-y", "clarion"]
    }
  }
}
```

## Run with Channels

To enable real-time message push between sessions:

```bash
claude --dangerously-load-development-channels server:clarion
```

Without this flag, MCP tools work but messages won't be pushed automatically to other sessions.

## Permissions (Recommended)

Add the following to `~/.claude/settings.json` to auto-approve all clarion tools:

```json
{
  "permissions": {
    "allow": [
      "mcp__clarion__room_join",
      "mcp__clarion__room_send",
      "mcp__clarion__room_list",
      "mcp__clarion__room_leave",
      "mcp__clarion__room_delete",
      "mcp__clarion__room_my",
      "Read"
    ]
  }
}
```

## Tools

Session ID is automatically assigned from the process PID. No need to specify it manually.

| Tool | Parameters | Description |
|-|-|-|
| `room_join` | room, name, role | Create or join a room. Auto-creates if not exists. Updates name/role on rejoin |
| `room_send` | room, content | Send a message to all other members in the room |
| `room_list` | (none) | List all rooms with members |
| `room_leave` | room | Leave a room |
| `room_delete` | room | Delete a room (creator only) |
| `room_my` | (none) | List rooms you belong to with your name/role |

## Usage

### 1. Join a room

Session A (Terminal 1):
```
room_join({ room: "dev", name: "Frontend", role: "Frontend developer. Handles UI/UX requests and responses." })
```

Session B (Terminal 2):
```
room_join({ room: "dev", name: "Backend", role: "Backend API developer. Handles data models and API design." })
```

### 2. Send a message

Session A:
```
room_send({ room: "dev", content: "What is the response schema for the login API?" })
```

### 3. Check my rooms

```
room_my()
```

## Storage

Data is stored as JSON files in `~/.claude/mcp-clarion/`.

```
~/.claude/mcp-clarion/
  rooms.json
  inboxes/{roomName}/{sessionId}.json
```

## License

MIT
