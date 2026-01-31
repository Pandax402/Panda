import { x402Protocol } from '../core/x402-protocol';
import { moltbookPayment } from './moltbook-payment';
import { privacyShield } from '../core/privacy-shield';
interface BridgeConfig {
  enablePrivacy: boolean;
  autoConfirm: boolean;
}
export class MoltbookX402Bridge {
  private config: BridgeConfig;
  constructor(config: Partial<BridgeConfig> = {}) {
    this.config = { enablePrivacy: true, autoConfirm: false, ...config };
  }
  async processPayment(headers: Record<string, string>, amount: number, recipient: string): Promise<{ success: boolean; token?: string }> {
    const sanitized = this.config.enablePrivacy ? privacyShield.sanitize(headers) : headers;
    const proof = x402Protocol.parseProofHeader(sanitized['x-402-proof'] ?? '');
    if (!proof) return { success: false };
    const intent = await moltbookPayment.createIntent(amount, recipient);
    if (!intent) return { success: false };
    if (this.config.autoConfirm) {
      await moltbookPayment.confirmPayment(intent.id, proof.signature);
    }
    return { success: true, token: intent.id };
  }
}
export const moltbookBridge = new MoltbookX402Bridge();
