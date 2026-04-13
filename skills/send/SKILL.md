---
name: send
description: 채팅방에 메시지를 전송합니다
user-invocable: true
argument-hint: "[room] [content]"
---

**MUST read [channel-check.md](../shared/channel-check.md) and follow its steps before proceeding.**

## Procedure

Arguments: $ARGUMENTS

If arguments are provided (first word is room name, rest is content), call `room_send` tool directly.

If no arguments provided, follow these steps:

1. Call `room_my` tool to get rooms the current session belongs to.
2. Use a single AskUserQuestion call with 2 questions at once:
   - Question 1: Room name. Use the session's joined rooms as options. The user can also type via "Type something".
   - Question 2: Message content. Provide 2 example options. The user can also type their own via "Type something".
3. Call `room_send` tool with the collected values.
