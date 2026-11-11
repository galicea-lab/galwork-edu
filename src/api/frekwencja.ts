// Klient API frekwencji (/v1/edu/frekwencja*). Token dokłada eduClient.
import { eduClient } from './client';
import type {
  FrekwencjaResponse,
  ListaObecnosciResponse,
  StatusObecnosci,
  ZapisObecnosciResponse,
} from '@/types/frekwencja';

export interface FrekwencjaParams {
  od?: string;
  do?: string;
  nr_albumu?: string;
}

export interface ListaParams {
  grupa: string;
  data?: string;
  email?: string;
}

export interface ZapisObecnosciParams {
  grupa: string;
  data: string;
  wpisy: Array<{ student: string; status: StatusObecnosci }>;
  wykladowca?: string;
}

export const frekwencjaApi = {
  /** Frekwencja studenta: podsumowanie per grupa i lista nieobecności. */
  async getAttendance(params: FrekwencjaParams = {}): Promise<FrekwencjaResponse> {
    const response = await eduClient.get<FrekwencjaResponse>('/frekwencja', { params });
    return response.data;
  },

  /** Lista obecności grupy na dany dzień (tylko prowadzący / dziekanat). */
  async getGroupAttendance(params: ListaParams): Promise<ListaObecnosciResponse> {
    const response = await eduClient.get<ListaObecnosciResponse>('/frekwencja/grupa', {
      params: { grupa: params.grupa, data: params.data, email: params.email },
    });
    return response.data;
  },

  /** Zapis listy obecności - idempotentny per (student, grupa, data). */
  async saveGroupAttendance(params: ZapisObecnosciParams): Promise<ZapisObecnosciResponse> {
    const response = await eduClient.post<ZapisObecnosciResponse>(
      '/frekwencja/grupa',
      { data: params.data, wpisy: params.wpisy, wykladowca: params.wykladowca },
      { params: { grupa: params.grupa } }
    );
    return response.data;
  },
};
