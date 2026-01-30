interface PriceData {
  symbol: string;
  usd: number;
  timestamp: number;
}
export class PriceOracle {
  private cache: Map<string, PriceData> = new Map();
  private cacheTimeout = 60000;
  async getPrice(symbol: string): Promise<number | null> {
    const cached = this.cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.usd;
    }
    return null;
  }
  updatePrice(symbol: string, usd: number): void {
    this.cache.set(symbol, { symbol, usd, timestamp: Date.now() });
  }
  convertToUsd(amount: number, symbol: string): number | null {
    const price = this.cache.get(symbol);
    return price ? amount * price.usd : null;
  }
}
export const priceOracle = new PriceOracle();
