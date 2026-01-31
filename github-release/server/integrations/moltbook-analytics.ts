import { moltbookClient } from './moltbook-client';
interface AnalyticsReport {
  period: string;
  totalVolume: number;
  transactionCount: number;
  averageAmount: number;
  topRecipients: { wallet: string; volume: number }[];
}
interface RevenueMetrics {
  daily: number;
  weekly: number;
  monthly: number;
  allTime: number;
}
export class MoltbookAnalytics {
  async getReport(wallet: string, period: 'day' | 'week' | 'month'): Promise<AnalyticsReport | null> {
    const result = await moltbookClient.request<AnalyticsReport>(`/analytics/report?wallet=${wallet}&period=${period}`);
    return result.data ?? null;
  }
  async getRevenue(wallet: string): Promise<RevenueMetrics | null> {
    const result = await moltbookClient.request<RevenueMetrics>(`/analytics/revenue?wallet=${wallet}`);
    return result.data ?? null;
  }
  async exportCsv(wallet: string, startDate: number, endDate: number): Promise<string | null> {
    const result = await moltbookClient.request<{ url: string }>(`/analytics/export?wallet=${wallet}&start=${startDate}&end=${endDate}`);
    return result.data?.url ?? null;
  }
}
export const moltbookAnalytics = new MoltbookAnalytics();
