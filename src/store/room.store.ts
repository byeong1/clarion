import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import type { IMember, IMessage, IRoom } from "../types/index.js";

const ROOMS_FILE = path.join(os.homedir(), ".claude", "mcp-clarion", "rooms.json");
const INBOXES_DIR = path.join(os.homedir(), ".claude", "mcp-clarion", "inboxes");

const ensureDirectory = (directoryPath: string): void => {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
};

export const roomStore = {
    getAll: (): IRoom[] => {
        ensureDirectory(path.dirname(ROOMS_FILE));
        if (!fs.existsSync(ROOMS_FILE)) {
            return [];
        }
        const fileContent = fs.readFileSync(ROOMS_FILE, "utf-8");
        return JSON.parse(fileContent) as IRoom[];
    },

    save: (rooms: IRoom[]): void => {
        ensureDirectory(path.dirname(ROOMS_FILE));
        fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2), "utf-8");
    },

    findByName: (roomName: string): IRoom | undefined => {
        const rooms = roomStore.getAll();
        return rooms.find((room) => room.name === roomName);
    },

    createOrJoin: (roomName: string, member: IMember): { room: IRoom; isNewRoom: boolean } => {
        const rooms = roomStore.getAll();
        const existingRoomIndex = rooms.findIndex((room) => room.name === roomName);

        if (existingRoomIndex === -1) {
            const newRoom: IRoom = {
                name: roomName,
                createdAt: new Date().toISOString(),
                createdBy: member.sessionId,
                members: [member],
            };
            rooms.push(newRoom);
            roomStore.save(rooms);
            return { room: newRoom, isNewRoom: true };
        }

        const existingRoom = rooms[existingRoomIndex];
        const existingMemberIndex = existingRoom.members.findIndex(
            (existingMember) => existingMember.sessionId === member.sessionId,
        );

        if (existingMemberIndex === -1) {
            existingRoom.members.push(member);
        } else {
            existingRoom.members[existingMemberIndex] = {
                ...existingRoom.members[existingMemberIndex],
                name: member.name,
                role: member.role,
            };
        }

        rooms[existingRoomIndex] = existingRoom;
        roomStore.save(rooms);
        return { room: existingRoom, isNewRoom: false };
    },

    removeMember: (roomName: string, sessionId: string): boolean => {
        const rooms = roomStore.getAll();
        const roomIndex = rooms.findIndex((room) => room.name === roomName);

        if (roomIndex === -1) {
            return false;
        }

        const targetRoom = rooms[roomIndex];
        const memberIndex = targetRoom.members.findIndex(
            (member) => member.sessionId === sessionId,
        );

        if (memberIndex === -1) {
            return false;
        }

        targetRoom.members.splice(memberIndex, 1);
        rooms[roomIndex] = targetRoom;
        roomStore.save(rooms);

        const inboxFilePath = path.join(INBOXES_DIR, roomName, `${sessionId}.json`);
        if (fs.existsSync(inboxFilePath)) {
            fs.unlinkSync(inboxFilePath);
        }

        return true;
    },

    removeRoom: (roomName: string): boolean => {
        const rooms = roomStore.getAll();
        const roomIndex = rooms.findIndex((room) => room.name === roomName);

        if (roomIndex === -1) {
            return false;
        }

        rooms.splice(roomIndex, 1);
        roomStore.save(rooms);

        const roomInboxDirectory = path.join(INBOXES_DIR, roomName);
        if (fs.existsSync(roomInboxDirectory)) {
            fs.rmSync(roomInboxDirectory, { recursive: true, force: true });
        }

        return true;
    },

    pushMessageToRoom: (
        roomName: string,
        senderSessionId: string,
        message: IMessage,
    ): number => {
        const targetRoom = roomStore.findByName(roomName);
        if (!targetRoom) {
            return 0;
        }

        const recipients = targetRoom.members.filter(
            (member) => member.sessionId !== senderSessionId,
        );

        recipients.forEach((recipient) => {
            const recipientInboxDirectory = path.join(INBOXES_DIR, roomName);
            ensureDirectory(recipientInboxDirectory);

            const recipientInboxFilePath = path.join(
                recipientInboxDirectory,
                `${recipient.sessionId}.json`,
            );

            const existingMessages: IMessage[] = fs.existsSync(recipientInboxFilePath)
                ? (JSON.parse(fs.readFileSync(recipientInboxFilePath, "utf-8")) as IMessage[])
                : [];

            existingMessages.push(message);
            fs.writeFileSync(
                recipientInboxFilePath,
                JSON.stringify(existingMessages, null, 2),
                "utf-8",
            );
        });

        return recipients.length;
    },

    consumeInbox: (roomName: string, sessionId: string): IMessage[] => {
        const inboxFilePath = path.join(INBOXES_DIR, roomName, `${sessionId}.json`);

        if (!fs.existsSync(inboxFilePath)) {
            return [];
        }

        const messages = JSON.parse(fs.readFileSync(inboxFilePath, "utf-8")) as IMessage[];
        fs.writeFileSync(inboxFilePath, JSON.stringify([], null, 2), "utf-8");
        return messages;
    },

    getRoomsBySessionId: (
        sessionId: string,
    ): Array<{ roomName: string; name: string; role: string }> => {
        const rooms = roomStore.getAll();
        const matchedRooms: Array<{ roomName: string; name: string; role: string }> = [];

        rooms.forEach((room) => {
            const matchedMember = room.members.find(
                (member) => member.sessionId === sessionId,
            );
            if (matchedMember) {
                matchedRooms.push({
                    roomName: room.name,
                    name: matchedMember.name,
                    role: matchedMember.role,
                });
            }
        });

        return matchedRooms;
    },
};
