// menu serwisu i metadane ról - jedno miejsce do customizacji
// nawigacji. Każda pozycja ma listę ról, w których jest widoczna; grupa znika,
// gdy nie zostaje w niej żadna pozycja. Kolejność ról w META_ROLI wyznacza
// kolejność w przełączniku roli.
import type { Rola } from '@/types/sesja';

export interface PozycjaMenu {
  path: string;
  tytul: string;
  ikona: string;
  /** Role, w których pozycja jest widoczna. */
  role: Rola[];
  /** Krótki opis - podpowiedź w rozwiniętym pasku. */
  opis?: string;
}

export interface GrupaMenu {
  tytul: string;
  ikona: string;
  role: Rola[];
  pozycje: PozycjaMenu[];
}

export interface MetaRoli {
  nazwa: string;
  ikona: string;
  opis: string;
  /** Klasy plakietki roli (tło, obramowanie, tekst). */
  plakietka: string;
  /** Kolor wskaźnika przy aktywnej pozycji menu. */
  akcent: string;
}

export const META_ROLI: Record<Rola, MetaRoli> = {
  student: {
    nazwa: 'Student',
    ikona: 'mdi:account-school-outline',
    opis: 'Plan zajęć, oceny, frekwencja i sprawy studenckie',
    plakietka: 'border-sky-200 bg-sky-50 text-sky-700',
    akcent: 'text-sky-600',
  },
  wykladowca: {
    nazwa: 'Nauczyciel akademicki',
    ikona: 'mdi:human-male-board',
    opis: 'Prowadzone grupy, siatka ocen i listy obecności',
    plakietka: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    akcent: 'text-emerald-600',
  },
  dziekanat: {
    nazwa: 'Pracownik administracji',
    ikona: 'mdi:office-building-outline',
    opis: 'Dane studentów, korespondencja i obieg spraw',
    plakietka: 'border-violet-200 bg-violet-50 text-violet-700',
    akcent: 'text-violet-600',
  },
  administrator: {
    nazwa: 'Administrator systemu',
    ikona: 'mdi:shield-account-outline',
    opis: 'Konfiguracja procesów i pełny wgląd w dane',
    plakietka: 'border-amber-200 bg-amber-50 text-amber-700',
    akcent: 'text-amber-600',
  },
  kandydat: {
    nazwa: 'Kandydat na studia',
    ikona: 'mdi:account-plus-outline',
    opis: 'Rekrutacja i dane osobowe kandydata',
    plakietka: 'border-rose-200 bg-rose-50 text-rose-700',
    akcent: 'text-rose-600',
  },
};

const WSZYSTKIE_ROLE: Rola[] = ['student', 'wykladowca', 'dziekanat', 'administrator', 'kandydat'];

const STUDENCI: Rola[] = ['student', 'dziekanat', 'administrator'];
const DYDAKTYKA: Rola[] = ['student', 'wykladowca', 'dziekanat', 'administrator'];
const OBSLUGA: Rola[] = ['dziekanat', 'administrator'];

/** Menu serwisu - kolejność grup i pozycji jak na ekranie. */
export const MENU: GrupaMenu[] = [
  {
    tytul: 'Dydaktyka',
    ikona: 'mdi:school-outline',
    role: DYDAKTYKA,
    pozycje: [
      {
        path: '/plan',
        tytul: 'Plan zajęć',
        ikona: 'mdi:calendar-week',
        role: DYDAKTYKA,
        opis: 'Tygodniowy rozkład zajęć z eksportem do kalendarza',
      },
      {
        path: '/oceny',
        tytul: 'Moje oceny',
        ikona: 'mdi:clipboard-text-outline',
        role: STUDENCI,
        opis: 'Oceny z przedmiotów, średnia i status semestrów',
      },
      {
        path: '/oceny/grupa',
        tytul: 'Siatka ocen',
        ikona: 'mdi:table-large',
        // siatka ocen wymaga kontekstu wykładowcy - dostępna w jego roli
        role: ['wykladowca'],
        opis: 'Wpisywanie i zatwierdzanie ocen grupy',
      },
      {
        path: '/frekwencja',
        tytul: 'Frekwencja',
        ikona: 'mdi:clipboard-check-outline',
        role: DYDAKTYKA,
        opis: 'Obecności studenta albo lista obecności grupy',
      },
    ],
  },
  {
    tytul: 'Sprawy studenckie',
    ikona: 'mdi:card-account-details-outline',
    role: STUDENCI,
    pozycje: [
      {
        path: '/studia',
        tytul: 'Moje studia',
        ikona: 'mdi:school-outline',
        role: STUDENCI,
        opis: 'Kierunek, tryb studiów i rozliczenie semestrów',
      },
      {
        path: '/legitymacja',
        tytul: 'Legitymacja',
        ikona: 'mdi:card-account-details',
        role: STUDENCI,
        opis: 'mLegitymacja - stan, zamówienie i kody',
      },
      {
        path: '/oplaty',
        tytul: 'Opłaty',
        ikona: 'mdi:cash-multiple',
        role: STUDENCI,
        opis: 'Należności, terminy i saldo',
      },
    ],
  },
  {
    tytul: 'Komunikacja',
    ikona: 'mdi:forum-outline',
    role: [...DYDAKTYKA, 'kandydat'],
    pozycje: [
      {
        // 2026-11-10: kalendarz z /v1/kalendarz (zajęcia, terminy akademickie, zadania, uczelnia).
        path: '/kalendarz',
        tytul: 'Kalendarz',
        ikona: 'mdi:calendar-month-outline',
        role: [...DYDAKTYKA, 'kandydat'],
        opis: 'Zajęcia, sesja, egzaminy, terminy płatności i zadań',
      },
      {
        path: '/notifications',
        tytul: 'Powiadomienia',
        ikona: 'mdi:bell-outline',
        role: [...DYDAKTYKA, 'kandydat'],
        opis: 'Powiadomienia systemowe',
      },
      {
        path: '/docs',
        tytul: 'Korespondencja z dziekanatem',
        ikona: 'mdi:file-document-multiple-outline',
        role: STUDENCI,
        opis: 'Pisma, wnioski i odpowiedzi dziekanatu',
      },
    ],
  },
  {
    tytul: 'Rekrutacja',
    ikona: 'mdi:account-plus-outline',
    role: ['kandydat'],
    pozycje: [
      {
        path: '/rekrutacja/dane',
        tytul: 'Moje dane osobowe',
        ikona: 'mdi:account-edit-outline',
        role: ['kandydat'],
        opis: 'Dane potrzebne w procesie rekrutacji',
      },
      {
        path: '/rekrutacja/kierunki',
        tytul: 'Wybór kierunku',
        ikona: 'mdi:school-outline',
        role: ['kandydat'],
        opis: 'Katalog kierunków i zgłoszenie',
      },
      {
        path: '/rekrutacja/przebieg',
        tytul: 'Przebieg rekrutacji',
        ikona: 'mdi:timeline-check-outline',
        role: ['kandydat'],
        opis: 'Zgłoszenia, etapy, decyzje i harmonogram',
      },
      {
        path: '/rekrutacja',
        tytul: 'Start rekrutacji',
        ikona: 'mdi:door-open',
        role: ['kandydat'],
        opis: 'Początek i wznowienie zgłoszenia',
      },
    ],
  },
  {
    tytul: 'Procesy',
    ikona: 'mdi:workflow',
    role: OBSLUGA,
    pozycje: [
      {
        path: '/process',
        tytul: 'Pulpit procesów',
        ikona: 'mdi:view-dashboard',
        role: OBSLUGA,
        opis: 'Podsumowanie procesów, spraw i zadań',
      },
      {
        path: '/process-models',
        tytul: 'Modele procesów',
        ikona: 'mdi:sitemap',
        role: OBSLUGA,
        opis: 'Definicje procesów i ich wersje',
      },
      {
        path: '/process-instances',
        tytul: 'Instancje procesów',
        ikona: 'mdi:progress-clock',
        role: OBSLUGA,
        opis: 'Trwające i zakończone sprawy',
      },
      {
        path: '/tasks',
        tytul: 'Moje zadania',
        ikona: 'mdi:checkbox-marked-circle-outline',
        role: OBSLUGA,
        opis: 'Zadania do podjęcia i wykonania',
      },
    ],
  },
  {
    tytul: 'Konto',
    ikona: 'mdi:account-circle-outline',
    role: ['student', 'wykladowca', 'dziekanat', 'administrator', 'kandydat'],
    pozycje: [
      {
        path: '/login',
        tytul: 'Profil i logowanie',
        ikona: 'mdi:login',
        role: ['student', 'wykladowca', 'dziekanat', 'administrator', 'kandydat'],
        opis: 'Sesja, wylogowanie i dane konta',
      },
    ],
  },
];

/**
 * Menu dla niezalogowanego gościa (strona logowania): tylko to, co nie wymaga
 * roli, żeby pasek boczny nie był pusty przed zalogowaniem.
 */
export const MENU_GOSCIA: GrupaMenu[] = [
  {
    tytul: 'Komunikacja',
    ikona: 'mdi:forum-outline',
    role: WSZYSTKIE_ROLE,
    pozycje: [
      {
        path: '/kalendarz',
        tytul: 'Kalendarz',
        ikona: 'mdi:calendar-month-outline',
        role: WSZYSTKIE_ROLE,
      },
      {
        path: '/notifications',
        tytul: 'Powiadomienia',
        ikona: 'mdi:bell-outline',
        role: WSZYSTKIE_ROLE,
      },
    ],
  },
  {
    tytul: 'Konto',
    ikona: 'mdi:account-circle-outline',
    role: WSZYSTKIE_ROLE,
    pozycje: [
      {
        path: '/login',
        tytul: 'Profil i logowanie',
        ikona: 'mdi:login',
        role: WSZYSTKIE_ROLE,
      },
    ],
  },
];

/** Menu dopasowane do roli (puste grupy odpadają). */
export function menuDlaRoli(rola: Rola | null | undefined, menu: GrupaMenu[] = MENU): GrupaMenu[] {
  if (!rola) return [];
  return menu
    .filter((grupa) => grupa.role.includes(rola))
    .map((grupa) => ({
      ...grupa,
      pozycje: grupa.pozycje.filter((pozycja) => pozycja.role.includes(rola)),
    }))
    .filter((grupa) => grupa.pozycje.length > 0);
}

/** Czy pozycja menu odpowiada bieżącej ścieżce (najdłuższe dopasowanie). */
export function czyAktywnaPozycja(pathname: string, path: string): boolean {
  if (pathname === path) return true;
  if (path === '/rekrutacja') return false; // '/rekrutacja/dane' ma własną pozycję
  return pathname.startsWith(`${path}/`);
}

export interface TytulStrony {
  tytul: string;
  grupa: string;
}

/**
 * Tytuł i grupa bieżącej strony (na górny pasek).
 *
 * Szuka najdłuższego pasującego prefiksu, żeby `/oceny/grupa` nie zostało
 * rozpoznane jako `/oceny`, a strony szczegółów (`/tasks/12`) dostały tytuł
 * listy.
 */
export function tytulStrony(pathname: string, rola: Rola | null | undefined): TytulStrony {
  const dostepne = menuDlaRoli(rola);
  const pozycje = dostepne.flatMap((grupa) =>
    grupa.pozycje.map((pozycja) => ({ ...pozycja, grupa: grupa.tytul }))
  );
  const dopasowania = pozycje
    .filter((pozycja) => czyAktywnaPozycja(pathname, pozycja.path))
    .sort((a, b) => b.path.length - a.path.length);

  if (dopasowania[0]) {
    return { tytul: dopasowania[0].tytul, grupa: dopasowania[0].grupa };
  }
  if (pathname.startsWith('/process-instances'))
    return { tytul: 'Instancja procesu', grupa: 'Procesy' };
  if (pathname.startsWith('/process-models')) return { tytul: 'Model procesu', grupa: 'Procesy' };
  if (pathname.startsWith('/tasks')) return { tytul: 'Zadanie', grupa: 'Procesy' };
  if (pathname.startsWith('/docs')) return { tytul: 'Sprawa', grupa: 'Komunikacja' };
  return { tytul: 'Wirtualna Uczelnia', grupa: 'Galwork Edu' };
}
