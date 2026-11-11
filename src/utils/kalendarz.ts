// 2026-11-10: pomocniki kalendarza - kolory zdarzeń, parametry zapytania
// z sesji (rola, wybrany student) i opis terminu po polsku.
import type { Rola, WybranyStudent } from '@/types/sesja';
import type { KalendarzParams, Zdarzenie, ZrodloId } from '@/types/kalendarz';
import { czyRolaAdministracyjna } from './sesja';

/** Kolor źródła - legenda i filtr. */
export const KOLOR_ZRODLA: Record<string, string> = {
  zajecia: '#2563eb',
  akademickie: '#7c3aed',
  zadania: '#0891b2',
  uczelnia: '#0d9488',
};

const KOLOR_TYPU: Record<string, string> = {
  exam: '#dc2626',
  exam_session: '#f59e0b',
  holiday: '#16a34a',
  leave: '#64748b',
};

const NIEZNANE = '#475569';

/** Kolor zdarzenia: typ (egzamin, sesja, płatność...) ważniejszy niż źródło. */
export function kolorZdarzenia(zdarzenie: Zdarzenie): string {
  const { zrodlo, typ, kolor, szczegoly } = zdarzenie.extendedProps;
  if (zrodlo === 'zajecia' && kolor) return kolor;
  if (typ === 'fee_due') {
    const stan = szczegoly?.state;
    if (stan === 'paid') return '#94a3b8';
    return stan === 'overdue' ? '#be123c' : '#ea580c';
  }
  if (zrodlo === 'zadania' && szczegoly?.po_terminie) return '#b91c1c';
  return KOLOR_TYPU[typ] ?? KOLOR_ZRODLA[zrodlo] ?? NIEZNANE;
}

export function kolorZrodla(id: ZrodloId): string {
  return KOLOR_ZRODLA[id] ?? NIEZNANE;
}

/**
 * Rola i osoba do zapytania. Dziekanat i administrator z wybranym studentem
 * oglądają jego kalendarz; bez wybranego - własny (zadania, kalendarz uczelni).
 */
export function osobaZapytania(
  rola: Rola | null,
  wybranyStudent: WybranyStudent | null
): Pick<KalendarzParams, 'rola' | 'nr_albumu'> {
  if (czyRolaAdministracyjna(rola) && wybranyStudent?.nr) {
    return { rola: 'student', nr_albumu: wybranyStudent.nr };
  }
  return rola ? { rola } : {};
}

/** RRRR-MM-DD w czasie lokalnym (toISOString przesuwa datę do UTC). */
export function dataIso(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

const DZIEN = new Intl.DateTimeFormat('pl-PL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const DZIEN_KROTKO = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
const GODZINA = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit' });

function dzienLokalny(text: string): Date {
  // '2027-01-25' -> północ czasu lokalnego (new Date('2027-01-25') to UTC)
  const [y, m, d] = text.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Opis terminu, np. „wtorek, 26 stycznia 2027, 08:00–09:30”. */
export function opisTerminu(zdarzenie: Zdarzenie): string {
  if (zdarzenie.allDay) {
    const start = dzienLokalny(zdarzenie.start);
    if (!zdarzenie.end) return DZIEN.format(start);
    const koniec = dzienLokalny(zdarzenie.end);
    koniec.setDate(koniec.getDate() - 1); // `end` jest wyłączny
    if (koniec.getTime() <= start.getTime()) return DZIEN.format(start);
    return `${DZIEN_KROTKO.format(start)} – ${DZIEN_KROTKO.format(koniec)}`;
  }
  const start = new Date(zdarzenie.start);
  const poczatek = `${DZIEN.format(start)}, ${GODZINA.format(start)}`;
  if (!zdarzenie.end) return poczatek;
  const koniec = new Date(zdarzenie.end);
  if (dataIso(koniec) === dataIso(start)) return `${poczatek}–${GODZINA.format(koniec)}`;
  return `${poczatek} – ${DZIEN.format(koniec)}, ${GODZINA.format(koniec)}`;
}

/** Kwota z Frappe (liczba) po polsku. */
export function kwota(value: unknown, waluta: unknown): string | null {
  const liczba = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(liczba)) return null;
  const tekst = new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(liczba);
  return waluta ? `${tekst} ${waluta}` : tekst;
}
