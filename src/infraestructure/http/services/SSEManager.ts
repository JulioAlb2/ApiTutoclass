import type { Response } from "express";

type SSEClient = {
  id: string;
  res: Response;
};

export type SSEEvent = {
  type: "message_created" | "message_updated" | "message_deleted";
  data: unknown;
};

export class SSEManager {
  private groups = new Map<number, SSEClient[]>();

  addClient(groupId: number, clientId: string, res: Response): void {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    res.write(`data: ${JSON.stringify({ type: "connected", groupId })}\n\n`);

    const client: SSEClient = { id: clientId, res };
    const clients = this.groups.get(groupId) ?? [];
    clients.push(client);
    this.groups.set(groupId, clients);

    res.on("close", () => {
      this.removeClient(groupId, clientId);
    });
  }

  removeClient(groupId: number, clientId: string): void {
    const clients = this.groups.get(groupId);
    if (!clients) return;

    const filtered = clients.filter((c) => c.id !== clientId);
    if (filtered.length === 0) {
      this.groups.delete(groupId);
    } else {
      this.groups.set(groupId, filtered);
    }
  }

  broadcast(groupId: number, event: SSEEvent): void {
    const clients = this.groups.get(groupId);
    if (!clients) return;

    const payload = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
    for (const client of clients) {
      client.res.write(payload);
    }
  }

  getClientCount(groupId: number): number {
    return this.groups.get(groupId)?.length ?? 0;
  }
}
