// 2026-11-10: klient kalendarza (/v1/kalendarz). Dokłada kalendarzClient (api/client.ts).
//  Ukośnik na końcu ścieżki - bez niego hub odpowiada przekierowaniem 307.
import { kalendarzClient } from './client';
import type {
  KalendarzParams,
  KalendarzResponse,
  SubskrypcjaNowa,
  SubskrypcjaStatus,
  Szczegolowosc,
  ZrodloInfo,
} from '@/types/kalendarz';
import type { Rola } from '@/types/sesja';

export const kalendarzApi = {
  /** Zdarzenia ze wszystkich (albo wybranych) źródeł w zakresie dat, `do` włącznie. */
  async getKalendarz(params: KalendarzParams): Promise<KalendarzResponse> {
    const response = await kalendarzClient.get<KalendarzResponse>('/', { params });
    return response.data;
  },

  /** Źródła włączone w instalacji (do filtra). */
  async getZrodla(): Promise<ZrodloInfo[]> {
    const response = await kalendarzClient.get<ZrodloInfo[]>('/zrodla');
    return response.data;
  },

  // 2026-11-10: subskrypcja w Google / Outlook (kanał ICS).
  async getSubskrypcja(): Promise<SubskrypcjaStatus> {
    const response = await kalendarzClient.get<SubskrypcjaStatus>('/subskrypcja');
    return response.data;
  },

  /** Nowy adres subskrypcji (poprzedni przestaje działać). */
  async utworzSubskrypcje(szczegolowosc: Szczegolowosc, rola?: Rola | null): Promise<SubskrypcjaNowa> {
    const response = await kalendarzClient.post<SubskrypcjaNowa>('/subskrypcja', {
      szczegolowosc,
      rola: rola ?? null,
    });
    return response.data;
  },

  async usunSubskrypcje(): Promise<SubskrypcjaStatus> {
    const response = await kalendarzClient.delete<SubskrypcjaStatus>('/subskrypcja');
    return response.data;
  },
};
