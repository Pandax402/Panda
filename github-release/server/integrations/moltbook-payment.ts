import { moltbookClient } from './moltbook-client';
interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  recipient: string;
  status: 'pending' | 'completed' | 'failed';
}
export class MoltbookPayment {
  async createIntent(amount: number, recipient: string, currency: string = 'SOL'): Promise<PaymentIntent | null> {
    const result = await moltbookClient.request<PaymentIntent>('/payments/intent', {
      method: 'POST',
      body: JSON.stringify({ amount, recipient, currency }),
    });
    return result.data ?? null;
  }
  async getIntent(id: string): Promise<PaymentIntent | null> {
    const result = await moltbookClient.request<PaymentIntent>(`/payments/intent/${id}`);
    return result.data ?? null;
  }
  async confirmPayment(intentId: string, signature: string): Promise<boolean> {
    const result = await moltbookClient.request(`/payments/confirm`, {
      method: 'POST',
      body: JSON.stringify({ intentId, signature }),
    });
    return result.success;
  }
}
export const moltbookPayment = new MoltbookPayment();
