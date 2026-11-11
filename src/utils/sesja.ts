// funkcje pomocnicze sesji - role z tokenu Keycloak (fallback,
// gdy hub nie odpowie), zapamiętanie wybranej roli i studenta oraz numer
// albumu, którego wymagają zapytania w rolach administracyjnych.
import CONFIG from '@/configs/config';
import type { Rola, WybranyStudent } from '@/types/sesja';

const KLUCZ_PAMIECI = 'galwork.edu.sesja';

export interface PreferencjeSesji {
  rola: Rola | null;
  email: string;
  student: WybranyStudent | null;
}

/** Role, w których ekrany wymagają wskazania studenta (nie ma "własnych" danych). */
export function czyRolaAdministracyjna(rola: Rola | null | undefined): boolean {
  return rola === 'dziekanat' || rola === 'administrator';
}

/** Nazwa grupy/roli bez prefiksów ścieżki i małymi literami (`/A/B` -> `b`). */
export function nazwaBezSciezki(wartosc: string): string {
  return wartosc.replace(/^\/+/, '').split('/').filter(Boolean).pop()?.trim().toLowerCase() ?? '';
}

/**
 * Role rozpoznawalne po tokenie Keycloak - administracja i kandydat.
 *
 * Student i wykładowca wymagają danych z Education, więc przychodzą z huba
 * (`/v1/edu/ja`). Ta funkcja jest wyłącznie awaryjnym źródłem ról, gdy hub
 * nie odpowiada - uprawnienia i tak sprawdza backend.
 */
export function roleZTokenu(user?: { roles?: string[]; groups?: string[] } | null): Rola[] {
  if (!user) return [];
  const nazwy = new Set(
    [...(user.roles ?? []), ...(user.groups ?? [])].map(nazwaBezSciezki).filter(Boolean)
  );
  const role: Rola[] = [];
  if (CONFIG.admin_roles.some((rola) => nazwy.has(nazwaBezSciezki(rola)))) {
    role.push('administrator');
  }
  if (CONFIG.staff_groups.some((grupa) => nazwy.has(nazwaBezSciezki(grupa)))) {
    role.push('dziekanat');
  }
  // kandydat - żeby strona startowa poprowadziła do /rekrutacja także wtedy,
  // gdy hub nie potwierdzi roli (np. token z realmu kandydatów)
  if (role.length === 0 && CONFIG.candidate_groups.some((grupa) => nazwy.has(nazwaBezSciezki(grupa)))) {
    role.push('kandydat');
  }
  return role;
}

export function pustePreferencje(): PreferencjeSesji {
  return { rola: null, email: '', student: null };
}

/** Zapisane preferencje z `localStorage` (puste na serwerze i przy braku wpisu). */
export function wczytajPreferencje(): PreferencjeSesji {
  if (typeof window === 'undefined') return pustePreferencje();
  try {
    const zapis = window.localStorage.getItem(KLUCZ_PAMIECI);
    if (!zapis) return pustePreferencje();
    const dane = JSON.parse(zapis) as Partial<PreferencjeSesji>;
    return {
      rola: (dane.rola as Rola | null) ?? null,
      email: dane.email ?? '',
      student: dane.student ?? null,
    };
  } catch {
    return pustePreferencje();
  }
}

export function zapiszPreferencje(preferencje: PreferencjeSesji): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KLUCZ_PAMIECI, JSON.stringify(preferencje));
  } catch {
    // tryb prywatny / brak miejsca - wybór roli po prostu nie przetrwa odświeżenia
  }
}

export interface AlbumZapytania {
  album?: string;
  blad?: string;
}

/** Minimalny kształt stanu sesji potrzebny do zbudowania zapytania. */
export interface SesjaDoZapytan {
  aktywnaRola: Rola | null;
  wybranyStudent: WybranyStudent | null;
}

/**
 * Numer albumu do zapytań API.
 *
 * Student i wykładowca nie podają numeru (hub bierze tożsamość z tokenu), a
 * dziekanat i administrator wskazują studenta w nagłówku aplikacji.
 */
export function albumZapytania(sesja: SesjaDoZapytan): AlbumZapytania {
  if (!czyRolaAdministracyjna(sesja.aktywnaRola)) return {};
  const album = sesja.wybranyStudent?.nr;
  if (!album) {
    return { blad: 'Wybierz studenta w nagłówku, żeby zobaczyć jego dane.' };
  }
  return { album };
}
