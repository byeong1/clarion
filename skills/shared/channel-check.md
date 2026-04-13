## Channel Check

Try to call the `AskUserQuestion` tool with this exact configuration:

```
AskUserQuestion({
  questions: [{
    question: "이 기능은 채널 모드에서만 사용할 수 있습니다.",
    header: "Channel",
    options: [
      { label: "확인", description: "채널 모드로 재시작하겠습니다" }
    ],
    multiSelect: false
  }]
})
```

- If `AskUserQuestion` tool is **NOT available** (tool not found, schema not loaded): this means channel mode is active. **Proceed** to the skill procedure.
- If `AskUserQuestion` tool **IS available** and the call succeeds: this means channel mode is NOT active. Display the following message and STOP. Do not proceed.

"실시간 메시지를 수신하려면 아래 명령으로 재시작하세요:
`claude --dangerously-load-development-channels plugin:clarion@clarion-plugins`"
