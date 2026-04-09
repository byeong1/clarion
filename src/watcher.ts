import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { roomStore } from "./store/room.store.js";

export interface IWatchEntry {
    roomName: string;
    sessionId: string;
}

export interface InboxWatcher {
    addEntry: (roomName: string, sessionId: string) => void;
    getEntries: () => ReadonlyArray<IWatchEntry>;
    start: () => void;
    stop: () => void;
}

export const createInboxWatcher = (server: Server): InboxWatcher => {
    const watchEntries: IWatchEntry[] = [];
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const POLL_INTERVAL_MS = 2000;

    const pollInboxes = () => {
        watchEntries.forEach((entry) => {
            const messages = roomStore.consumeInbox(entry.roomName, entry.sessionId);
            messages.forEach((message) => {
                server.notification({
                    method: "notifications/claude/channel",
                    params: {
                        content: message.content,
                        meta: {
                            room: entry.roomName,
                            from_name: message.fromName,
                            from_role: message.fromRole,
                            timestamp: message.timestamp,
                        },
                    },
                });
            });
        });
    };

    const addEntry = (roomName: string, sessionId: string) => {
        const isAlreadyWatching = watchEntries.some(
            (entry) => entry.roomName === roomName && entry.sessionId === sessionId,
        );
        if (!isAlreadyWatching) {
            watchEntries.push({ roomName, sessionId });
        }
    };

    const start = () => {
        if (intervalId !== null) return;
        intervalId = setInterval(pollInboxes, POLL_INTERVAL_MS);
    };

    const stop = () => {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };

    const getEntries = (): ReadonlyArray<IWatchEntry> => {
        return watchEntries;
    };

    return { addEntry, getEntries, start, stop };
};
