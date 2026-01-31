import { moltbookClient } from './moltbook-client';
interface Subscription {
  id: string;
  wallet: string;
  planId: string;
  amount: number;
  interval: 'daily' | 'weekly' | 'monthly';
  nextBilling: number;
  status: 'active' | 'paused' | 'cancelled';
}
export class MoltbookSubscription {
  async create(wallet: string, planId: string, amount: number, interval: Subscription['interval']): Promise<Subscription | null> {
    const result = await moltbookClient.request<Subscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ wallet, planId, amount, interval }),
    });
    return result.data ?? null;
  }
  async cancel(subscriptionId: string): Promise<boolean> {
    const result = await moltbookClient.request(`/subscriptions/${subscriptionId}/cancel`, { method: 'POST' });
    return result.success;
  }
  async pause(subscriptionId: string): Promise<boolean> {
    const result = await moltbookClient.request(`/subscriptions/${subscriptionId}/pause`, { method: 'POST' });
    return result.success;
  }
  async list(wallet: string): Promise<Subscription[]> {
    const result = await moltbookClient.request<Subscription[]>(`/subscriptions?wallet=${wallet}`);
    return result.data ?? [];
  }
}
export const moltbookSubscription = new MoltbookSubscription();
