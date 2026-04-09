---
name: room-delete
description: 채팅방을 삭제합니다 (방장만 가능)
user-invocable: true
argument-hint: "[room]"
---

Arguments: $ARGUMENTS

If argument is provided, call `room_delete` tool directly.

If no argument provided:

1. Call `room_list` tool to get existing rooms.
2. Use AskUserQuestion to ask which room to delete. Use existing room names as options.
3. Call `room_delete` tool with the selected room.

Only the room creator can delete a room.
