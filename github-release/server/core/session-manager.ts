interface Session {
  id: string;
  createdAt: number;
  lastAccess: number;
  data: Record<string, unknown>;
}
export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private ttl: number;
  constructor(ttlMs: number = 3600000) {
    this.ttl = ttlMs;
  }
  create(): string {
    const id = crypto.randomUUID();
    this.sessions.set(id, { id, createdAt: Date.now(), lastAccess: Date.now(), data: {} });
    return id;
  }
  get(id: string): Session | null {
    const session = this.sessions.get(id);
    if (!session || Date.now() - session.lastAccess > this.ttl) {
      this.sessions.delete(id);
      return null;
    }
    session.lastAccess = Date.now();
    return session;
  }
  destroy(id: string): void {
    this.sessions.delete(id);
  }
}
export const sessionManager = new SessionManager();
