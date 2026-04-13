## Channel Check

MUST use the `AskUserQuestion` tool to confirm channel mode. Do NOT substitute with plain text questions:

```
AskUserQuestion({
  questions: [{
    question: "채널 모드로 실행하셨습니까?",
    header: "Channel",
    options: [
      { label: "Yes", description: "claude --dangerously-load-development-channels plugin:clarion@clarion-plugins 명령으로 실행했습니다" },
      { label: "No", description: "일반 claude 명령으로 실행했습니다" }
    ],
    multiSelect: false
  }]
})
```

- If "No": display "실시간 메시지를 수신하려면 아래 명령으로 재시작하세요: `claude --dangerously-load-development-channels plugin:clarion@clarion-plugins`" and STOP. Do not proceed.
- If "Yes": continue with the skill procedure.
