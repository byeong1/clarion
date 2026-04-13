---
name: send
description: 채팅방에 메시지를 전송합니다
user-invocable: true
argument-hint: "[room] [content]"
---

First, use AskUserQuestion to confirm channel mode:
- question: "채널 모드로 실행하셨습니까?"
- header: "Channel"
- options:
  - label: "Yes", description: "claude --dangerously-load-development-channels plugin:clarion@clarion-plugins 명령으로 실행했습니다"
  - label: "No", description: "일반 claude 명령으로 실행했습니다"
- If "No": display "실시간 메시지를 수신하려면 아래 명령으로 재시작하세요:\nclaude --dangerously-load-development-channels plugin:clarion@clarion-plugins" and stop. Do not proceed.
- If "Yes": continue with the skill.

Arguments: $ARGUMENTS

If arguments are provided (first word is room name, rest is content), call `room_send` tool directly.

If no arguments provided, follow these steps:

1. Call `room_my` tool to get rooms the current session belongs to.
2. Use a single AskUserQuestion call with 2 questions at once:
   - Question 1: Room name. Use the session's joined rooms as options. The user can also type via "Type something".
   - Question 2: Message content. Provide 2 example options. The user can also type their own via "Type something".
3. Call `room_send` tool with the collected values.
