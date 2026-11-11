// klient API opłat (/v1/edu/oplaty). Token dokłada eduClient.
import { eduClient } from './client';
import type { OplatyResponse } from '@/types/oplaty';

export const oplatyApi = {
  /** Należności studenta: kwoty, terminy i stan (paid/due/overdue). */
  async getFees(nr_albumu?: string): Promise<OplatyResponse> {
    const response = await eduClient.get<OplatyResponse>('/oplaty', {
      params: nr_albumu ? { nr_albumu } : undefined,
    });
    return response.data;
  },
};
