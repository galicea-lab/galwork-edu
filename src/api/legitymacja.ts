// klient API legitymacji (/v1/edu/legitymacja*). Token dokłada
// eduClient. Kody QR pobierane są jednorazowo i nie są nigdzie zapisywane.
import { eduClient } from './client';
import type {
  KodyLegitymacjiResponse,
  LegitymacjaResponse,
  ZamowienieResponse,
} from '@/types/legitymacja';

export interface ZamowienieParams {
  rodzaj?: 'Issue' | 'Renewal';
  wazna_od?: string;
  wazna_do?: string;
  nr_albumu?: string;
}

export const legitymacjaApi = {
  /** Stan legitymacji (bez kodów QR). */
  async getCard(nr_albumu?: string): Promise<LegitymacjaResponse> {
    const response = await eduClient.get<LegitymacjaResponse>('/legitymacja', {
      params: nr_albumu ? { nr_albumu } : undefined,
    });
    return response.data;
  },

  /** Ponowne odpytanie MLS o stan zamówienia. */
  async refreshCard(nr_albumu?: string): Promise<LegitymacjaResponse> {
    const response = await eduClient.post<LegitymacjaResponse>('/legitymacja/odswiez', null, {
      params: nr_albumu ? { nr_albumu } : undefined,
    });
    return response.data;
  },

  /** Zamówienie legitymacji (Issue) albo przedłużenie (Renewal). */
  async orderCard(params: ZamowienieParams): Promise<ZamowienieResponse> {
    const response = await eduClient.post<ZamowienieResponse>(
      '/legitymacja/zamow',
      { rodzaj: params.rodzaj ?? 'Issue', wazna_od: params.wazna_od, wazna_do: params.wazna_do },
      { params: params.nr_albumu ? { nr_albumu: params.nr_albumu } : undefined }
    );
    return response.data;
  },

  /** Jednorazowy odczyt QR i kodu aktywacyjnego gotowej legitymacji. */
  async getCodes(nr_albumu?: string): Promise<KodyLegitymacjiResponse> {
    const response = await eduClient.post<KodyLegitymacjiResponse>('/legitymacja/kody', null, {
      params: nr_albumu ? { nr_albumu } : undefined,
    });
    return response.data;
  },

  /** Wniosek o unieważnienie legitymacji. */
  async revokeCard(powod?: string, nr_albumu?: string): Promise<ZamowienieResponse> {
    const response = await eduClient.post<ZamowienieResponse>(
      '/legitymacja/uniewaznij',
      { powod },
      { params: nr_albumu ? { nr_albumu } : undefined }
    );
    return response.data;
  },
};
