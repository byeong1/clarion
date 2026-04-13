import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { roomStore } from "./store/room.store.js";
import type { IMessage } from "./types/index.js";
import type { InboxWatcher } from "./watcher.js";

const SESSION_ID = `pid-${process.ppid}`;

let currentInboxWatcher: InboxWatcher | null = null;
export const setInboxWatcher = (watcher: InboxWatcher): void => {
    currentInboxWatcher = watcher;
};

export const getSessionId = (): string => SESSION_ID;

export const createServer = (): McpServer => {
    const server = new McpServer(
        { name: "clarion", version: "0.1.0" },
        {
            capabilities: { experimental: { "claude/channel": {} } },
            instructions: [
                'Chat room messages arrive as <channel source="clarion" room="..." from_name="..." from_role="..."> tags. Read the message and respond according to your role. Use room_send tool to reply.',
                "",
                "## Language rule",
                "- ALWAYS respond in the same language as the received message or user prompt.",
                "- Match the language of the incoming content.",
                "",
                "## Communication rules",
                "- Keep messages minimal. No greetings, no filler, no preamble.",
                "- Send only the essential request or response.",
                "- Do NOT repeat what the other session already said.",
                "- When replying via room_send, use the shortest form that conveys the answer.",
                "",
                "## Display formats",
                "",
                "When displaying room_join results, ALWAYS use this exact format:",
                '"{room}" joined. Members : {count}',
                "",
                "| Name | Role |",
                "|-|-|",
                "| {name} | {role} |",
                "",
                'When receiving a join notification (content contains "joined"), ALWAYS use this exact format:',
                '"{room}" — "{name}" joined. Role : {role}',
                "",
                'When receiving a leave notification (content contains "left"), ALWAYS use this exact format:',
                '"{room}" — "{name}" left.',
                "",
                "After calling room_send, ALWAYS display this exact format only (no other text):",
                '"{room}" message sent',
                "",
                "When receiving a normal message (not join/leave), ALWAYS display this exact format:",
                '"{room}" "{from_name}" : {content}',
            ].join("\n"),
        },
    );

    registerTools(server);

    return server;
};


const registerTools = (server: McpServer): void => {
    /* room_join */
    server.tool(
        "room_join",
        "Join an existing room or create a new one if it does not exist. Returns the current member list.",
        {
            room: z.string().describe("Room name to join or create"),
            name: z.string().describe("Your display name in the room"),
            role: z.string().describe("Your role in the room (e.g. 'frontend', 'backend')"),
        },
        async ({ room, name, role }) => {
            const joinResult = roomStore.createOrJoin(room, {
                sessionId: SESSION_ID,
                name,
                role,
                joinedAt: new Date().toISOString(),
            });

            if (currentInboxWatcher) {
                currentInboxWatcher.addEntry(room, SESSION_ID);
            }

            /* 기존 멤버들에게 입장 알림 */
            if (!joinResult.isNewRoom) {
                const joinNotification: IMessage = {
                    from: SESSION_ID,
                    fromName: name,
                    fromRole: role,
                    content: `"${name}" joined. Role : ${role}`,
                    timestamp: new Date().toISOString(),
                };
                roomStore.pushMessageToRoom(room, SESSION_ID, joinNotification);
            }

            const memberList = joinResult.room.members
                .map((member) => `- ${member.name} (${member.role})`)
                .join("\n");

            const actionLabel = joinResult.isNewRoom ? "created" : "joined";

            return {
                content: [
                    {
                        type: "text" as const,
                        text: `Room "${room}" ${actionLabel}. Current members (${joinResult.room.members.length}):\n${memberList}`,
                    },
                ],
            };
        },
    );

    /* room_send */
    server.tool(
        "room_send",
        "Send a message to all other members in the room.",
        {
            room: z.string().describe("Room name to send the message to"),
            content: z.string().describe("Message content to send"),
        },
        async ({ room, content }) => {
            const foundRoom = roomStore.findByName(room);

            if (!foundRoom) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Room "${room}" does not exist.`,
                        },
                    ],
                };
            }

            const senderMember = foundRoom.members.find(
                (member) => member.sessionId === SESSION_ID,
            );

            if (!senderMember) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: "You are not a member of this room.",
                        },
                    ],
                };
            }

            const message: IMessage = {
                from: SESSION_ID,
                fromName: senderMember.name,
                fromRole: senderMember.role,
                content,
                timestamp: new Date().toISOString(),
            };

            const recipientCount = roomStore.pushMessageToRoom(room, SESSION_ID, message);

            return {
                content: [
                    {
                        type: "text" as const,
                        text: `Message sent to ${recipientCount} recipient(s) in room "${room}".`,
                    },
                ],
            };
        },
    );

    /* room_list */
    server.tool(
        "room_list",
        "List all active rooms and their members.",
        {},
        async () => {
            const allRooms = roomStore.getAll();

            if (allRooms.length === 0) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: "No rooms.",
                        },
                    ],
                };
            }

            const roomDescriptions = allRooms
                .map((room) => {
                    const memberDescriptions = room.members
                        .map(
                            (member) =>
                                `    - ${member.name} (${member.role}) [${member.sessionId}]`,
                        )
                        .join("\n");

                    return `Room: ${room.name} (created: ${room.createdAt})\n  Members (${room.members.length}):\n${memberDescriptions}`;
                })
                .join("\n\n");

            return {
                content: [
                    {
                        type: "text" as const,
                        text: `${allRooms.length} room(s):\n\n${roomDescriptions}`,
                    },
                ],
            };
        },
    );

    /* room_leave */
    server.tool(
        "room_leave",
        "Leave a room. Removes you from the member list.",
        {
            room: z.string().describe("Room name to leave"),
        },
        async ({ room }) => {
            /* 퇴장 알림을 위해 제거 전 멤버 정보 조회 */
            const foundRoom = roomStore.findByName(room);
            const leavingMember = foundRoom?.members.find(
                (member) => member.sessionId === SESSION_ID,
            );

            const isRemoved = roomStore.removeMember(room, SESSION_ID);

            if (isRemoved && leavingMember) {
                const leaveNotification: IMessage = {
                    from: SESSION_ID,
                    fromName: leavingMember.name,
                    fromRole: leavingMember.role,
                    content: `"${leavingMember.name}" left.`,
                    timestamp: new Date().toISOString(),
                };
                roomStore.pushMessageToRoom(room, SESSION_ID, leaveNotification);
            }

            return {
                content: [
                    {
                        type: "text" as const,
                        text: isRemoved
                            ? `Left room "${room}" successfully.`
                            : "Room or member not found.",
                    },
                ],
            };
        },
    );

    /* room_delete */
    server.tool(
        "room_delete",
        "Delete a room and all its data including messages.",
        {
            room: z.string().describe("Room name to delete"),
        },
        async ({ room }) => {
            const targetRoom = roomStore.findByName(room);

            if (!targetRoom) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: "Room not found.",
                        },
                    ],
                };
            }

            if (targetRoom.createdBy !== SESSION_ID) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: "Only the room creator can delete this room.",
                        },
                    ],
                };
            }

            roomStore.removeRoom(room);

            return {
                content: [
                    {
                        type: "text" as const,
                        text: `Room "${room}" deleted successfully.`,
                    },
                ],
            };
        },
    );

    /* room_my */
    server.tool(
        "room_my",
        "List all rooms the current session is a member of.",
        {},
        async () => {
            const memberRooms = roomStore.getRoomsBySessionId(SESSION_ID);

            if (memberRooms.length === 0) {
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: "Not a member of any room.",
                        },
                    ],
                };
            }

            const roomDescriptions = memberRooms
                .map((memberRoom) => {
                    return `- ${memberRoom.roomName}: name="${memberRoom.name}", role="${memberRoom.role}"`;
                })
                .join("\n");

            return {
                content: [
                    {
                        type: "text" as const,
                        text: `Member of ${memberRooms.length} room(s):\n${roomDescriptions}`,
                    },
                ],
            };
        },
    );
};
