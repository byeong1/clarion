---
name: room
description: 채팅방에 참여하거나 새로 생성합니다
user-invocable: true
argument-hint: "[room] [name] [role]"
---

Arguments: $ARGUMENTS

If all 3 arguments are provided (room, name, role), call `room_join` tool directly.

If no arguments provided, follow these steps:

1. Call `room_list` tool to get existing rooms.
2. Use AskUserQuestion to ask room name. Use existing room names as options. The user can also type a new room name via "Type something".
3. Use AskUserQuestion to ask display name. Provide 2 example options (e.g. "Frontend", "Backend"). The user can also type their own via "Type something".
4. Use AskUserQuestion to ask role. Provide 2 example options (e.g. "Frontend developer", "Backend developer"). The user can also type their own via "Type something".
5. Call `room_join` tool with the collected values.
