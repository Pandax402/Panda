interface AgentConfig {
  budgetLimit: number;
  allowedDomains: string[];
}
export class AgentRuntime {
  private spent = 0;
  private config: AgentConfig;
  constructor(config: Partial<AgentConfig> = {}) {
    this.config = { budgetLimit: Infinity, allowedDomains: ['*'], ...config };
  }
  canExecute(price: number, domain: string): boolean {
    if (this.spent + price > this.config.budgetLimit) return false;
    if (!this.config.allowedDomains.includes('*') && !this.config.allowedDomains.includes(domain)) return false;
    return true;
  }
  recordSpend(amount: number): void { this.spent += amount; }
  getRemaining(): number { return this.config.budgetLimit - this.spent; }
}
export const agentRuntime = new AgentRuntime();
