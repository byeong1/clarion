---
name: room-delete
description: 채팅방을 삭제합니다 (방장만 가능)
user-invocable: true
argument-hint: "[room]"
---

First, run ToolSearch({ query: "select:AskUserQuestion" }) to load the tool schema. Then use AskUserQuestion to confirm channel mode:
- question: "채널 모드로 실행하셨습니까?"
- header: "Channel"
- options:
  - label: "Yes", description: "claude --dangerously-load-development-channels plugin:clarion@clarion-plugins 명령으로 실행했습니다"
  - label: "No", description: "일반 claude 명령으로 실행했습니다"
- If "No": display "실시간 메시지를 수신하려면 아래 명령으로 재시작하세요:\nclaude --dangerously-load-development-channels plugin:clarion@clarion-plugins" and stop. Do not proceed.
- If "Yes": continue with the skill.

Arguments: $ARGUMENTS

If argument is provided, call `room_delete` tool directly.

If no argument provided:

1. Call `room_list` tool to get existing rooms.
2. Use AskUserQuestion to ask which room to delete. Use existing room names as options.
3. Call `room_delete` tool with the selected room.

Only the room creator can delete a room.
