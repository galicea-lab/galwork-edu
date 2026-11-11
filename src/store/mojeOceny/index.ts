// Stan karty ocen studenta (/v1/edu/oceny) - pobranie, filtr roku/semestru i komunikat błędu.
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getStudentGrades } from '@/api/oceny';
import type { KartaOcen } from '@/types/oceny';
// numer albumu z sesji (student - własny, dziekanat - wybrany).
import { SesjaDoZapytan, albumZapytania } from '@/utils/sesja';

export interface FetchKartaParams {
  rok?: string;
  semestr?: string;
}

export const fetchKarta = createAsyncThunk<
  KartaOcen,
  FetchKartaParams,
  { state: { sesja: SesjaDoZapytan } }
>('mojeOceny/fetch', async (params, { getState }) => {
  const { album, blad } = albumZapytania(getState().sesja);
  if (blad) throw new Error(blad);
  const response = await getStudentGrades({ ...params, nr_albumu: album });
  // student bez wpisów dostaje `oceny: null` - traktujemy to
  // jak pustą kartę, a nie błąd.
  if (response.code !== 0) {
    throw new Error(response.message || 'Nie udało się pobrać ocen');
  }
  if (!response.oceny) {
    return {
      student: '',
      prog_zaliczenia: 50,
      przedmioty: [],
      srednia: {
        metoda: 'ects_weighted',
        wartosc: null,
        przedmioty: 0,
        zaliczone: 0,
        niezaliczone: 0,
      },
      semestry: [],
    };
  }
  return response.oceny;
});

interface MojeOcenyState {
  karta: KartaOcen | null;
  rok: string;
  semestr: string;
  loading: boolean;
  error: string | null;
}

const initialState: MojeOcenyState = {
  karta: null,
  rok: '',
  semestr: '',
  loading: false,
  error: null,
};

const mojeOcenySlice = createSlice({
  name: 'mojeOceny',
  initialState,
  reducers: {
    setRok: (state, action: PayloadAction<string>) => {
      state.rok = action.payload;
    },
    setSemestr: (state, action: PayloadAction<string>) => {
      state.semestr = action.payload;
    },
    wyczyscBlad: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKarta.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKarta.fulfilled, (state, action) => {
        state.loading = false;
        state.karta = action.payload;
      })
      .addCase(fetchKarta.rejected, (state, action) => {
        state.loading = false;
        state.karta = null;
        state.error = action.error.message || 'Nie udało się pobrać ocen';
      });
  },
});

export const { setRok, setSemestr, wyczyscBlad } = mojeOcenySlice.actions;
export default mojeOcenySlice.reducer;
