// stan sesji - kim jest użytkownik (role z /v1/edu/ja) i w
// jakiej roli aktualnie pracuje. Wybrana rola steruje menu i zapytaniami API;
// zapamiętujemy ją w localStorage (utils/sesja.ts), żeby przetrwała odświeżenie.
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { jaApi } from '@/api/ja';
import type { Rola, Uzytkownik, WybranyStudent } from '@/types/sesja';
import { PreferencjeSesji, czyRolaAdministracyjna, pustePreferencje } from '@/utils/sesja';

export interface WynikSesji {
  uzytkownik: Uzytkownik | null;
  role: Rola[];
  ostrzezenie: string;
}

/**
 * Pobranie tożsamości z huba.
 *
 * `roleZTokenu` to role odczytane z tokenu Keycloak - używane, gdy hub nie
 * odpowie, żeby administrator/dziekanat nie zostali bez menu. Komunikat błędu
 * trafia do `ostrzezenie`, nie do `error`: brak odpowiedzi huba nie jest
 * błędem strony, a ekrany same zgłoszą, czego nie udało się pobrać.
 */
export const fetchSesja = createAsyncThunk<WynikSesji, { roleZTokenu: Rola[] }>(
  'sesja/fetch',
  async (payload) => {
    try {
      const response = await jaApi.getIdentity();
      if (response.code !== 0 || !response.uzytkownik) {
        throw new Error(response.message || 'Nie udało się ustalić roli użytkownika');
      }
      return {
        uzytkownik: response.uzytkownik,
        role: response.uzytkownik.role?.length ? response.uzytkownik.role : payload.roleZTokenu,
        ostrzezenie: response.ostrzezenie || '',
      };
    } catch (error) {
      return {
        uzytkownik: null,
        role: payload.roleZTokenu,
        ostrzezenie:
          error instanceof Error ? error.message : 'Nie udało się ustalić roli użytkownika',
      };
    }
  }
);

interface SesjaState {
  uzytkownik: Uzytkownik | null;
  /** Role dostępne do przełączenia, w kolejności ważności z huba. */
  dostepneRole: Rola[];
  aktywnaRola: Rola | null;
  wybranyStudent: WybranyStudent | null;
  preferencje: PreferencjeSesji;
  status: 'idle' | 'loading' | 'ready';
  ostrzezenie: string;
}

const initialState: SesjaState = {
  uzytkownik: null,
  dostepneRole: [],
  aktywnaRola: null,
  wybranyStudent: null,
  preferencje: pustePreferencje(),
  status: 'idle',
  ostrzezenie: '',
};

/** Czy zapisana rola należy do osoby, która się właśnie zalogowała. */
function taSamaOsoba(preferencje: PreferencjeSesji, uzytkownik: Uzytkownik | null): boolean {
  if (!preferencje.email || !uzytkownik?.email) return true;
  return preferencje.email.trim().toLowerCase() === uzytkownik.email.trim().toLowerCase();
}

const sesjaSlice = createSlice({
  name: 'sesja',
  initialState,
  reducers: {
    /** Preferencje z localStorage - dispatchowane w layoucie po zamontowaniu. */
    wczytajPreferencje: (state, action: PayloadAction<PreferencjeSesji>) => {
      state.preferencje = action.payload;
      state.wybranyStudent = action.payload.student ?? null;
    },
    ustawRole: (state, action: PayloadAction<Rola>) => {
      if (!state.dostepneRole.includes(action.payload)) return;
      state.aktywnaRola = action.payload;
      if (!czyRolaAdministracyjna(action.payload)) state.wybranyStudent = null;
    },
    ustawStudenta: (state, action: PayloadAction<WybranyStudent | null>) => {
      state.wybranyStudent = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSesja.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSesja.fulfilled, (state, action) => {
        state.status = 'ready';
        state.uzytkownik = action.payload.uzytkownik;
        state.dostepneRole = action.payload.role;
        state.ostrzezenie = action.payload.ostrzezenie;

        const zapamietana =
          taSamaOsoba(state.preferencje, action.payload.uzytkownik) &&
          state.preferencje.rola &&
          action.payload.role.includes(state.preferencje.rola)
            ? state.preferencje.rola
            : null;
        state.aktywnaRola = zapamietana ?? action.payload.role[0] ?? null;

        if (
          !czyRolaAdministracyjna(state.aktywnaRola) ||
          !taSamaOsoba(state.preferencje, action.payload.uzytkownik)
        ) {
          state.wybranyStudent = null;
        }
      });
  },
});

export const { wczytajPreferencje, ustawRole, ustawStudenta } = sesjaSlice.actions;

export default sesjaSlice.reducer;
