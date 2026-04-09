# clarion

Claude Code 세션 간 채팅방 기반 메시징을 위한 MCP 서버.

여러 Claude Code 세션(터미널)이 채팅방에 참여하여 메시지를 주고받을 수 있습니다. 각 세션은 채팅방마다 이름과 역할을 설정할 수 있으며, 역할에 맞게 사고하고 요청/응답합니다.

[English](./README.md)

## 설치

```bash
npx -y @baebyeongil/clarion
```

## Claude Code에 등록

```bash
claude mcp add clarion --scope user --transport stdio -- npx -y @baebyeongil/clarion
```

또는 `~/.claude.json`에 직접 추가:

```json
{
  "mcpServers": {
    "clarion": {
      "command": "npx",
      "args": ["-y", "clarion"]
    }
  }
}
```

## 채널 모드 실행

세션 간 실시간 메시지 push를 활성화하려면:

```bash
claude --dangerously-load-development-channels server:clarion
```

이 플래그 없이 실행하면 MCP tool은 동작하지만 메시지가 자동으로 상대 세션에 push되지 않습니다.

## 권한 설정 (권장)

`~/.claude/settings.json`에 추가하면 clarion tool 사용 시 승인 프롬프트를 건너뜁니다:

```json
{
  "permissions": {
    "allow": [
      "mcp__clarion__room_join",
      "mcp__clarion__room_send",
      "mcp__clarion__room_list",
      "mcp__clarion__room_leave",
      "mcp__clarion__room_delete",
      "mcp__clarion__room_my",
      "Read"
    ]
  }
}
```

## Tools

세션 ID는 프로세스 PID에서 자동 할당됩니다. 직접 지정할 필요 없습니다.

| Tool | Parameters | Description |
|-|-|-|
| `room_join` | room, name, role | 채팅방 생성 또는 참여. 없으면 생성+자동참여, 있으면 참여. 재참여 시 name/role 갱신 |
| `room_send` | room, content | 채팅방에 메시지 전송. 본인 제외 전원 수신 |
| `room_list` | (none) | 전체 채팅방 목록 + 멤버 조회 |
| `room_leave` | room | 채팅방에서 나가기 |
| `room_delete` | room | 채팅방 삭제 (방장만 가능) |
| `room_my` | (none) | 내가 참여 중인 채팅방 목록 + 이름/역할 조회 |

## 사용 예시

### 1. 채팅방 참여

세션 A (터미널 1):
```
room_join({ room: "dev", name: "Frontend", role: "프론트엔드 개발 담당. UI/UX 관련 요청과 응답을 처리한다." })
```

세션 B (터미널 2):
```
room_join({ room: "dev", name: "Backend", role: "백엔드 API 개발 담당. 데이터 모델과 API 설계를 처리한다." })
```

### 2. 메시지 전송

세션 A:
```
room_send({ room: "dev", content: "로그인 API의 응답 스키마를 알려주세요." })
```

### 3. 내 채팅방 확인

```
room_my()
```

## 저장소

데이터는 `~/.claude/mcp-clarion/`에 JSON 파일로 저장됩니다.

```
~/.claude/mcp-clarion/
  rooms.json
  inboxes/{roomName}/{sessionId}.json
```

## 라이선스

MIT
