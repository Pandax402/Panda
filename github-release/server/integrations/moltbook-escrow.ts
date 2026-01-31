import { moltbookClient } from './moltbook-client';
interface Escrow {
  id: string;
  amount: number;
  payer: string;
  payee: string;
  arbiter: string;
  status: 'funded' | 'released' | 'disputed' | 'refunded';
  createdAt: number;
}
export class MoltbookEscrow {
  async create(amount: number, payer: string, payee: string, arbiter: string): Promise<Escrow | null> {
    const result = await moltbookClient.request<Escrow>('/escrow', {
      method: 'POST',
      body: JSON.stringify({ amount, payer, payee, arbiter }),
    });
    return result.data ?? null;
  }
  async release(escrowId: string, signature: string): Promise<boolean> {
    const result = await moltbookClient.request(`/escrow/${escrowId}/release`, {
      method: 'POST',
      body: JSON.stringify({ signature }),
    });
    return result.success;
  }
  async dispute(escrowId: string, reason: string): Promise<boolean> {
    const result = await moltbookClient.request(`/escrow/${escrowId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return result.success;
  }
}
export const moltbookEscrow = new MoltbookEscrow();
