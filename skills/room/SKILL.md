---
name: room
description: 채팅방에 참여하거나 새로 생성합니다
user-invocable: true
argument-hint: "[room] [name] [role]"
---

**MUST read [channel-check.md](../shared/channel-check.md) and follow its steps before proceeding.**

## Procedure

Arguments: $ARGUMENTS

If all 3 arguments are provided (room, name, role), call `room_join` tool directly.

If no arguments provided, follow these steps:

1. Call `room_list` tool to get existing rooms.
2. Use a single AskUserQuestion call with 3 questions at once:
   - Question 1: Room name. Use existing room names as options. The user can also type a new room name via "Type something".
   - Question 2: Display name. Provide 2 example options (e.g. "Frontend", "Backend"). The user can also type their own via "Type something".
   - Question 3: Role. Provide 2 example options (e.g. "Frontend developer", "Backend developer"). The user can also type their own via "Type something".
3. Call `room_join` tool with the collected values.
