// 2026-11-10: typy kalendarza - odpowiedź GET /v1/kalendarz/ huba
// (kalendarz/schemas.py). Zdarzenie ma kształt zdarzenia FullCalendar:
// `allDay` z wyłącznym `end`, czasy ISO 8601 z przesunięciem strefy.
import type { Rola } from './sesja';

export type ZrodloId = 'zajecia' | 'akademickie' | 'zadania' | 'uczelnia' | string;

export interface ZdarzenieProps {
  zrodlo: ZrodloId;
  typ: string;
  ref?: string | null;
  miejsce?: string | null;
  opis?: string | null;
  kolor?: string | null;
  szczegoly: Record<string, unknown>;
}

export interface Zdarzenie {
  id: string;
  title: string;
  start: string;
  end?: string | null;
  allDay: boolean;
  url?: string | null;
  organizer?: string | null;
  extendedProps: ZdarzenieProps;
}

export interface StatusZrodla {
  id: ZrodloId;
  nazwa: string;
  dotyczy: boolean;
  ok: boolean;
  liczba: number;
  komunikat: string;
}

export interface KalendarzResponse {
  code: number;
  message: string;
  od: string;
  do: string;
  strefa: string;
  ostrzezenie: string;
  zrodla: StatusZrodla[];
  events: Zdarzenie[];
}

export interface ZrodloInfo {
  id: ZrodloId;
  nazwa: string;
  opis: string;
}

export interface KalendarzParams {
  od: string;
  do: string;
  zrodla?: string;
  rola?: Rola;
  nr_albumu?: string;
  email?: string;
}

// 2026-11-10: subskrypcja kalendarza (kanał ICS z tokenem osobistym).
export type Szczegolowosc = 'minimalna' | 'pelna';

export interface SubskrypcjaStatus {
  aktywna: boolean;
  szczegolowosc?: Szczegolowosc | null;
  rola?: Rola | null;
  utworzono?: string | null;
  ostatnie_pobranie?: string | null;
  liczba_pobran: number;
}

/** Odpowiedź na utworzenie - adres z tokenem widoczny tylko raz. */
export interface SubskrypcjaNowa extends SubskrypcjaStatus {
  url: string;
  webcal_url: string;
}
