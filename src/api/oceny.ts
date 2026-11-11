// klient API ocen (/v1/edu/oceny*). Token dokłada eduClient.
import { eduClient } from './client';
import type { KartaOcenResponse, OcenyGrupyResponse, WpisOceny, ZapisOcenResponse } from '@/types/oceny';

export interface ZapisOcenParams {
  grupa: string;
  assessment_plan: string;
  wpisy: WpisOceny[];
  zatwierdz?: boolean;
}

export const ocenyApi = {
  /** Siatka ocen grupy: plany oceniania z kryteriami oraz studenci grupy. */
  async getGroupGrid(grupa: string): Promise<OcenyGrupyResponse> {
    const response = await eduClient.get<OcenyGrupyResponse>('/oceny/grupa', {
      params: { grupa },
    });
    return response.data;
  },

  /** Zapis ocen grupy; `zatwierdz` od razu zatwierdza wyniki (submit). */
  async saveGroupGrades(params: ZapisOcenParams): Promise<ZapisOcenResponse> {
    const response = await eduClient.post<ZapisOcenResponse>(
      '/oceny/grupa',
      {
        assessment_plan: params.assessment_plan,
        wpisy: params.wpisy,
        zatwierdz: params.zatwierdz ?? false,
      },
      { params: { grupa: params.grupa } }
    );
    return response.data;
  },
};

export interface KartaOcenParams {
  rok?: string;
  semestr?: string;
  nr_albumu?: string;
}

/** Karta ocen studenta (opcjonalnie zawężona do roku/semestru). */
export async function getStudentGrades(params: KartaOcenParams = {}): Promise<KartaOcenResponse> {
  const response = await eduClient.get<KartaOcenResponse>('/oceny', { params });
  return response.data;
}
