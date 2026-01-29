interface AccessToken {
  id: string;
  wallet: string;
  expiresAt: number;
  used: boolean;
}
export class AccessController {
  private tokens: Map<string, AccessToken> = new Map();
  issueToken(wallet: string): string {
    const id = crypto.randomUUID();
    this.tokens.set(id, { id, wallet, expiresAt: Date.now(), used: false });
    return id;
  }
  validateToken(id: string): boolean {
    const token = this.tokens.get(id);
    if (!token || token.used) return false;
    token.used = true;
    this.tokens.delete(id);
    return true;
  }
}
export const accessController = new AccessController();
