// Klient API "Moje studia" (/v1/edu/studia). Token dokłada eduClient.
import { eduClient } from './client';
import type { StudiaResponse } from '@/types/studia';

export const studiaApi = {
  /** Profil studenta, zapisy na kierunek i statusy semestrów. */
  async getStudies(nr_albumu?: string): Promise<StudiaResponse> {
    const response = await eduClient.get<StudiaResponse>('/studia', {
      params: nr_albumu ? { nr_albumu } : undefined,
    });
    return response.data;
  },
};
