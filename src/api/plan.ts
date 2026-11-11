// Klient API planu zajęć (/v1/edu/plan*). Token dokłada eduClient (api/client.ts).
import { eduClient } from './client';
import type { KontekstResponse, PlanResponse } from '@/types/plan';

export interface PlanParams {
  od?: string;
  do?: string;
  kierunek?: string;
  nr_albumu?: string;
}

export interface PlanWykladowcyParams {
  od?: string;
  do?: string;
  email?: string;
}

export interface KontekstParams {
  semestr?: string;
  email?: string;
}

export const planApi = {
  /** Plan zajęć studenta (zakres dat opcjonalny - domyślnie tydzień). */
  async getPlan(params: PlanParams = {}): Promise<PlanResponse> {
    const response = await eduClient.get<PlanResponse>('/plan', { params });
    return response.data;
  },

  /** Plan zajęć wykładowcy - grupy, które prowadzi. */
  async getLecturerPlan(params: PlanWykladowcyParams = {}): Promise<PlanResponse> {
    const response = await eduClient.get<PlanResponse>('/plan/wykladowca', { params });
    return response.data;
  },

  /** Grupy i przedmioty wykładowcy (nagłówek ekranu wykładowcy). */
  async getLecturerContext(params: KontekstParams = {}): Promise<KontekstResponse> {
    const response = await eduClient.get<KontekstResponse>('/plan/wykladowca/kontekst', { params });
    return response.data;
  },
};
