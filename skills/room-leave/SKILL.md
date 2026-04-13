---
name: room-leave
description: 채팅방에서 나갑니다
user-invocable: true
argument-hint: "[room]"
allowed-tools: ["AskUserQuestion"]
---

**MUST read [channel-check.md](../shared/channel-check.md) and follow its steps before proceeding.**

## Procedure

Arguments: $ARGUMENTS

If argument is provided, call `room_leave` tool directly.

If no argument provided:

1. Call `room_my` tool to get rooms the current session belongs to.
2. Use AskUserQuestion to ask which room to leave. Use the session's joined rooms as options.
3. Call `room_leave` tool with the selected room.
