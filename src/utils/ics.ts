// eksport planu do kalendarza (.ics) po stronie przeglądarki -
// hub nie wystawia takiego pliku, a dane planu są już w kliencie.
import type { WpisPlanu } from '@/types/plan';
import { dniaKlucz, przytnijCzas } from './plan';

const ZNACZNIK_CZASU = 'DTSTART;TZID=Europe/Warsaw';

function linia(klucz: string, wartosc: string): string {
  return `${klucz}:${wartosc.replace(/\r?\n/g, '\\n')}`;
}

function znacznikCzasu(iso: string, godzina: string): string {
  const [year, month, day] = iso.split('-');
  const czas = przytnijCzas(godzina).replace(':', '');
  return `${year}${month}${day}T${czas}00`;
}

export function wpisDoVevent(wpis: WpisPlanu): string[] {
  const poczatek = znacznikCzasu(dniaKlucz(wpis), wpis.od);
  const koniec = znacznikCzasu(dniaKlucz(wpis), wpis.do);
  const opis = [
    wpis.przedmiot?.name || wpis.przedmiot?.code || '',
    wpis.grupa ? `grupa: ${wpis.grupa}` : '',
    wpis.wykladowca ? `prowadzący: ${wpis.wykladowca}` : '',
    wpis.kierunek ? `kierunek: ${wpis.kierunek}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return [
    'BEGIN:VEVENT',
    linia('UID', `${wpis.id}@galwork-edu`),
    linia('DTSTAMP', `${poczatek}Z`),
    `${ZNACZNIK_CZASU}:${poczatek}`,
    `DTEND;TZID=Europe/Warsaw:${koniec}`,
    linia('SUMMARY', wpis.tytul || wpis.przedmiot?.name || wpis.przedmiot?.code || 'Zajęcia'),
    wpis.sala ? linia('LOCATION', wpis.sala) : '',
    wpis.grupa ? linia('CATEGORIES', wpis.grupa) : '',
    opis ? linia('DESCRIPTION', opis) : '',
    'END:VEVENT',
  ].filter(Boolean);
}

export function zbudujIcs(wpisy: WpisPlanu[], nazwa: string): string {
  const linie = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Galwork//Wirtualna Uczelnia//PL',
    'CALSCALE:GREGORIAN',
    linia('X-WR-CALNAME', nazwa),
    ...wpisy.flatMap(wpisDoVevent),
    'END:VCALENDAR',
  ];
  return linie.join('\r\n');
}

export function pobierzIcs(wpisy: WpisPlanu[], nazwa: string, plik: string): void {
  const blob = new Blob([zbudujIcs(wpisy, nazwa)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = plik.endsWith('.ics') ? plik : `${plik}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
