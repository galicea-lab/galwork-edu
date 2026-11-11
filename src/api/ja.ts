// klient API tożsamości (/v1/edu/ja). Token dokłada eduClient.
import { eduClient } from './client';
import type { JaResponse } from '@/types/sesja';

export const jaApi = {
  /** Role zalogowanego użytkownika (student, wykładowca, dziekanat, administrator). */
  async getIdentity(): Promise<JaResponse> {
    const response = await eduClient.get<JaResponse>('/ja');
    return response.data;
  },
};
