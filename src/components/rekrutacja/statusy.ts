// opisy statusów rekrutacji (wartości z Frappe, admissions_poland) i etapy
// zgłoszenia pokazywane kandydatowi na stronie "Przebieg rekrutacji".
import type { BadgeVariant } from '@/components/common';
import type { Decyzja, Zgloszenie } from '@/api/rekrutacja';

export const OPLATA: Record<Zgloszenie['fee_status'], string> = {
  Unpaid: 'Nieopłacona',
  Paid: 'Opłacona',
  Exempt: 'Bez opłaty',
  Refund: 'Do zwrotu',
};

export const KWALIFIKACJA: Record<string, string> = {
  Qualified: 'Zakwalifikowany',
  Reserve: 'Na liście rezerwowej',
  'Not Qualified': 'Niezakwalifikowany',
};

export const PRZYJECIE: Record<string, string> = {
  Admitted: 'Przyjęty',
  Resigned: 'Rezygnacja',
  'Not Admitted': 'Nieprzyjęty',
  Cancelled: 'Anulowane',
};

export const DOKUMENT: Record<string, { label: string; variant: BadgeVariant }> = {
  Missing: { label: 'Brak', variant: 'warning' },
  Submitted: { label: 'Złożony', variant: 'info' },
  Verified: { label: 'Zweryfikowany', variant: 'success' },
  Rejected: { label: 'Odrzucony', variant: 'danger' },
};

export const DECYZJA: Record<Decyzja['status'], { label: string; variant: BadgeVariant }> = {
  Published: { label: 'Czeka na odbiór', variant: 'warning' },
  Delivered: { label: 'Doręczona', variant: 'success' },
};

export type StanEtapu = 'gotowe' | 'biezace' | 'oczekuje' | 'negatywne';

export interface Etap {
  nazwa: string;
  opis: string;
  stan: StanEtapu;
}

/** Etapy zgłoszenia: złożenie, opłata, dokumenty, kwalifikacja, przyjęcie. */
export function etapyZgloszenia(z: Zgloszenie): Etap[] {
  const dokumenty = z.documents ?? [];
  const braki = dokumenty.filter((d) => d.status === 'Missing' || d.status === 'Rejected').length;
  const oplacone = z.fee_status === 'Paid' || z.fee_status === 'Exempt';
  const kwalifikacja = z.qualification_status || '';
  const przyjecie = z.admission_status || '';

  const etapy: Etap[] = [
    {
      nazwa: 'Zgłoszenie',
      opis: z.submitted_on ? `Złożone ${formatData(z.submitted_on)}` : 'Złożone',
      stan: 'gotowe',
    },
    {
      nazwa: 'Opłata rekrutacyjna',
      opis: OPLATA[z.fee_status] ?? z.fee_status,
      stan: oplacone ? 'gotowe' : 'biezace',
    },
    {
      nazwa: 'Dokumenty',
      opis: dokumenty.length === 0 ? 'Nie są wymagane na tym etapie' : braki ? `Brakuje: ${braki} z ${dokumenty.length}` : 'Komplet',
      stan: braki ? 'biezace' : 'gotowe',
    },
    {
      nazwa: 'Kwalifikacja',
      opis: kwalifikacja ? KWALIFIKACJA[kwalifikacja] ?? kwalifikacja : 'Po zamknięciu rejestracji',
      stan: !kwalifikacja ? 'oczekuje' : kwalifikacja === 'Not Qualified' ? 'negatywne' : 'gotowe',
    },
    {
      nazwa: 'Przyjęcie na studia',
      opis: przyjecie ? PRZYJECIE[przyjecie] ?? przyjecie : 'Decyzja komisji rekrutacyjnej',
      stan: !przyjecie ? 'oczekuje' : przyjecie === 'Admitted' ? 'gotowe' : 'negatywne',
    },
  ];
  // bieżący jest tylko pierwszy niezakończony etap
  let bylBiezacy = false;
  return etapy.map((etap) => {
    if (etap.stan !== 'biezace') return etap;
    if (bylBiezacy) return { ...etap, stan: 'oczekuje' };
    bylBiezacy = true;
    return etap;
  });
}

/** Zgłoszenie można wycofać, dopóki nie ma wyniku kwalifikacji. */
export function moznaWycofac(z: Zgloszenie): boolean {
  return z.submission_status !== 'Withdrawn' && !z.qualification_status && !z.admission_status;
}

const DATA = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
const DATA_CZAS = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** Data z Frappe (`2026-11-30 21:48:19` albo `2026-11-30`) po polsku. */
export function formatData(wartosc?: string | null, zGodzina = false): string {
  if (!wartosc) return '';
  const data = new Date(wartosc.replace(' ', 'T'));
  if (Number.isNaN(data.getTime())) return wartosc;
  return (zGodzina && wartosc.length > 10 ? DATA_CZAS : DATA).format(data);
}

/** Okres "od - do" (pusty koniec: "od ...", pusty początek: "do ..."). */
export function okres(od?: string | null, doDnia?: string | null): string {
  if (od && doDnia) return `${formatData(od, true)} – ${formatData(doDnia, true)}`;
  if (od) return `od ${formatData(od, true)}`;
  if (doDnia) return `do ${formatData(doDnia, true)}`;
  return 'termin nie został ogłoszony';
}
