---
name: send
description: 채팅방에 메시지를 전송합니다
user-invocable: true
argument-hint: "[room] [content]"
---

Arguments: $ARGUMENTS

If arguments are provided (first word is room name, rest is content), call `room_send` tool directly.

If no arguments provided, ask the user sequentially:
1. Room name
2. Message content

Then call `room_send` tool with the collected values.
