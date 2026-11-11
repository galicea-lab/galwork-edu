// pomocnicze funkcje ekranu planu zajęć - tygodnie, formatowanie
// i kolory wpisów (kolory pochodzą z Course Schedule: color/class_schedule_color).
import type { WpisPlanu } from '@/types/plan';

export const DNI_TYGODNIA = [
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
  'Niedziela',
];

const KOLORY: Record<string, string> = {
  blue: 'border-l-sky-500 bg-sky-50/60',
  green: 'border-l-emerald-500 bg-emerald-50/60',
  red: 'border-l-rose-500 bg-rose-50/60',
  orange: 'border-l-amber-500 bg-amber-50/60',
  yellow: 'border-l-yellow-400 bg-yellow-50/60',
};

const TYPY: Record<string, string> = {
  Lecture: 'Wykład',
  Tutorial: 'Ćwiczenia',
  Lab: 'Laboratorium',
  Laboratory: 'Laboratorium',
  Seminar: 'Seminarium',
  Project: 'Projekt',
  Exam: 'Egzamin',
};

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7; // poniedziałek = 0
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map((part) => Number(part));
  return new Date(year, (month || 1) - 1, day || 1);
}

export function formatZakres(od: string, doDaty: string): string {
  if (!od || !doDaty) return '';
  const from = parseIsoDate(od);
  const to = parseIsoDate(doDaty);
  const formatter = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${formatter.format(from)} – ${formatter.format(to)}`;
}

export function formatDzien(iso: string): string {
  const date = parseIsoDate(iso);
  return new Intl.DateTimeFormat('pl-PL', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(date);
}

export function przytnijCzas(value: string): string {
  return (value || '').slice(0, 5);
}

export function klasyKoloru(kolor?: string | null): string {
  return KOLORY[kolor || ''] || 'border-l-slate-400 bg-white';
}

export function etykietaTypu(typ?: string | null): string | null {
  if (!typ) return null;
  return TYPY[typ] || typ;
}

export function grupujPoDniach(wpisy: WpisPlanu[], od: string): Record<string, WpisPlanu[]> {
  const dni: Record<string, WpisPlanu[]> = {};
  for (let offset = 0; offset < 7; offset += 1) {
    dni[toIsoDate(addDays(parseIsoDate(od), offset))] = [];
  }
  for (const wpis of wpisy) {
    const klucz = dniaKlucz(wpis);
    if (!dni[klucz]) dni[klucz] = [];
    dni[klucz].push(wpis);
  }
  for (const klucz of Object.keys(dni)) {
    dni[klucz].sort((a, b) => a.od.localeCompare(b.od));
  }
  return dni;
}

export function dniaKlucz(wpis: WpisPlanu): string {
  return (wpis.data || '').slice(0, 10);
}

export function kierunkiPlanu(wpisy: WpisPlanu[]): string[] {
  return Array.from(new Set(wpisy.map((wpis) => wpis.kierunek).filter(Boolean))) as string[];
}
