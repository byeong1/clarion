---
name: room
description: 채팅방에 참여하거나 새로 생성합니다
user-invocable: true
argument-hint: "[room] [name] [role]"
---

> **⚠️ 이 기능을 사용하려면 아래 명령으로 Claude Code를 실행해야 합니다:**
> ```
> claude --dangerously-load-development-channels server:clarion
> ```
> 일반 `claude` 명령으로 실행한 경우, 실시간 메시지 수신이 동작하지 않습니다.
> 사용자에게 위 안내를 표시한 후, 올바른 명령으로 재시작했는지 확인하세요. 재시작하지 않았다면 스킬 실행을 중단하세요.

Arguments: $ARGUMENTS

If all 3 arguments are provided (room, name, role), call `room_join` tool directly.

If no arguments provided, follow these steps:

1. Call `room_list` tool to get existing rooms.
2. Use AskUserQuestion to ask room name. Use existing room names as options. The user can also type a new room name via "Type something".
3. Use AskUserQuestion to ask display name. Provide 2 example options (e.g. "Frontend", "Backend"). The user can also type their own via "Type something".
4. Use AskUserQuestion to ask role. Provide 2 example options (e.g. "Frontend developer", "Backend developer"). The user can also type their own via "Type something".
5. Call `room_join` tool with the collected values.
