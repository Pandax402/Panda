import { moltbookClient } from './moltbook-client';
interface Payout {
  id: string;
  amount: number;
  recipient: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
}
export class MoltbookPayout {
  async create(amount: number, recipient: string): Promise<Payout | null> {
    const result = await moltbookClient.request<Payout>('/payouts', {
      method: 'POST',
      body: JSON.stringify({ amount, recipient }),
    });
    return result.data ?? null;
  }
  async getStatus(payoutId: string): Promise<Payout | null> {
    const result = await moltbookClient.request<Payout>(`/payouts/${payoutId}`);
    return result.data ?? null;
  }
  async listPending(): Promise<Payout[]> {
    const result = await moltbookClient.request<Payout[]>('/payouts?status=pending');
    return result.data ?? [];
  }
  async cancel(payoutId: string): Promise<boolean> {
    const result = await moltbookClient.request(`/payouts/${payoutId}/cancel`, { method: 'POST' });
    return result.success;
  }
}
export const moltbookPayout = new MoltbookPayout();
