---
name: room
description: 채팅방에 참여하거나 새로 생성합니다
user-invocable: true
argument-hint: "[room] [name] [role]"
---

Arguments: $ARGUMENTS

If arguments are provided (3 values: room, name, role), call `room_join` tool directly with those values.

If no arguments provided, ask the user sequentially:
1. Room name
2. Display name
3. Role

Then call `room_join` tool with the collected values.
