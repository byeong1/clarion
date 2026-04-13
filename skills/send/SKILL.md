---
name: send
description: 채팅방에 메시지를 전송합니다
user-invocable: true
argument-hint: "[room] [content]"
---

> **⚠️ 이 기능을 사용하려면 아래 명령으로 Claude Code를 실행해야 합니다:**
> ```
> claude --dangerously-load-development-channels server:clarion
> ```
> 일반 `claude` 명령으로 실행한 경우, 실시간 메시지 수신이 동작하지 않습니다.
> 사용자에게 위 안내를 표시한 후, 올바른 명령으로 재시작했는지 확인하세요. 재시작하지 않았다면 스킬 실행을 중단하세요.

Arguments: $ARGUMENTS

If arguments are provided (first word is room name, rest is content), call `room_send` tool directly.

If no arguments provided, follow these steps:

1. Call `room_my` tool to get rooms the current session belongs to.
2. Use AskUserQuestion to ask room name. Use the session's joined rooms as options. The user can also type via "Type something".
3. Use AskUserQuestion to ask message content. Provide 2 example options. The user can also type their own via "Type something".
4. Call `room_send` tool with the collected values.
