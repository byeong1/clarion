#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer, setInboxWatcher } from "./server.js";
import { createInboxWatcher } from "./watcher.js";
import { roomStore } from "./store/room.store.js";

const main = async (): Promise<void> => {
    const mcpServer = createServer();
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);

    const inboxWatcher = createInboxWatcher(mcpServer.server);
    setInboxWatcher(inboxWatcher);
    inboxWatcher.start();

    const cleanup = () => {
        inboxWatcher.stop();
        inboxWatcher.getEntries().forEach((entry) => {
            roomStore.removeMember(entry.roomName, entry.sessionId);
        });
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("exit", cleanup);
};

main().catch(console.error);
