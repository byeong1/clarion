---
name: room-leave
description: 채팅방에서 나갑니다
user-invocable: true
argument-hint: "[room]"
---

Arguments: $ARGUMENTS

If argument is provided, call `room_leave` tool directly with that room name.

If no argument provided, ask the user for the room name, then call `room_leave` tool.
