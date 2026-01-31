import crypto from 'crypto';
interface MoltbookWebhookEvent {
  id: string;
  type: 'payment.success' | 'payment.failed' | 'refund.processed';
  data: Record<string, unknown>;
  timestamp: number;
  signature: string;
}
export class MoltbookWebhook {
  private secret: string;
  constructor(webhookSecret: string) {
    this.secret = webhookSecret;
  }
  verifySignature(payload: string, signature: string): boolean {
    const expected = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }
  parseEvent(body: string, signature: string): MoltbookWebhookEvent | null {
    if (!this.verifySignature(body, signature)) return null;
    return JSON.parse(body);
  }
  handleEvent(event: MoltbookWebhookEvent): void {
    switch (event.type) {
      case 'payment.success': this.onPaymentSuccess(event.data); break;
      case 'payment.failed': this.onPaymentFailed(event.data); break;
      case 'refund.processed': this.onRefund(event.data); break;
    }
  }
  private onPaymentSuccess(data: Record<string, unknown>): void {}
  private onPaymentFailed(data: Record<string, unknown>): void {}
  private onRefund(data: Record<string, unknown>): void {}
}
