// haki sesji - aktywna rola, dostępne role, kontekst studenta.
// Ekrany korzystają z nich, żeby dobrać domyślną zakładkę i pokazać właściwe
// dane (student widzi siebie, dziekanat - wybranego studenta).
import { useAppSelector } from '@/store';
import type { Rola, StudentTozsamosc, WybranyStudent, WykladowcaTozsamosc } from '@/types/sesja';

export function useAktywnaRola(): Rola | null {
  return useAppSelector((state) => state.sesja.aktywnaRola);
}

/** Role, między którymi użytkownik może się przełączać (kolejność z huba). */
export function useDostepneRole(): Rola[] {
  return useAppSelector((state) => state.sesja.dostepneRole);
}

export function useWybranyStudent(): WybranyStudent | null {
  return useAppSelector((state) => state.sesja.wybranyStudent);
}

export function useStudentSesji(): StudentTozsamosc | null {
  return useAppSelector((state) => state.sesja.uzytkownik?.student ?? null);
}

export function useWykladowcaSesji(): WykladowcaTozsamosc | null {
  return useAppSelector((state) => state.sesja.uzytkownik?.wykladowca ?? null);
}

export function useStatusSesji(): 'idle' | 'loading' | 'ready' {
  return useAppSelector((state) => state.sesja.status);
}
