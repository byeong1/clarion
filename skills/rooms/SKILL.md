---
name: rooms
description: 전체 채팅방 목록을 조회합니다
user-invocable: true
---

First, use AskUserQuestion to confirm channel mode:
- question: "채널 모드로 실행하셨습니까?"
- header: "Channel"
- options:
  - label: "Yes", description: "claude --dangerously-load-development-channels plugin:clarion@clarion-plugins 명령으로 실행했습니다"
  - label: "No", description: "일반 claude 명령으로 실행했습니다"
- If "No": display "실시간 메시지를 수신하려면 아래 명령으로 재시작하세요:\nclaude --dangerously-load-development-channels plugin:clarion@clarion-plugins" and stop. Do not proceed.
- If "Yes": continue with the skill.

Call `room_list` tool and display the results.
