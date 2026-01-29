interface PrivacyConfig {
  stripHeaders: boolean;
  minimalLogging: boolean;
}
export class PrivacyShield {
  private config: PrivacyConfig;
  private readonly STRIPPED = ['x-forwarded-for', 'user-agent', 'referer', 'cookie'];
  constructor(config: Partial<PrivacyConfig> = {}) {
    this.config = { stripHeaders: true, minimalLogging: true, ...config };
  }
  sanitize(headers: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      if (!this.STRIPPED.includes(k.toLowerCase())) result[k] = v;
    }
    return result;
  }
}
export const privacyShield = new PrivacyShield();
