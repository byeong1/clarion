---
name: room-delete
description: 채팅방을 삭제합니다 (방장만 가능)
user-invocable: true
argument-hint: "[room]"
---

Arguments: $ARGUMENTS

If argument is provided, call `room_delete` tool directly with that room name.

If no argument provided, ask the user for the room name, then call `room_delete` tool.

Only the room creator can delete a room.
