// stan ekranu opłat - pobranie należności i filtr stanu
// (wszystkie / do zapłaty / po terminie / zapłacone).
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { oplatyApi } from '@/api/oplaty';
import type { Oplaty, StanOplaty } from '@/types/oplaty';
// numer albumu z sesji (student - własny, dziekanat - wybrany).
import { SesjaDoZapytan, albumZapytania } from '@/utils/sesja';

export type FiltrOplat = 'all' | StanOplaty;

export const fetchOplaty = createAsyncThunk<Oplaty, void, { state: { sesja: SesjaDoZapytan } }>(
  'oplaty/fetch',
  async (_param, { getState }) => {
    const { album, blad } = albumZapytania(getState().sesja);
    if (blad) throw new Error(blad);
    const response = await oplatyApi.getFees(album);
    // student bez należności dostaje `oplaty: null` - to pusta lista, nie błąd.
    if (response.code !== 0) {
      throw new Error(response.message || 'Nie udało się pobrać opłat');
    }
    if (!response.oplaty) {
      return {
        student: '',
        oplaty: [],
        suma_zaleglosci: 0,
        suma_zaplacona: 0,
        suma_przeterminowana: 0,
        wymaga_zaplaty: false,
      };
    }
    return response.oplaty;
  }
);

interface OplatyState {
  oplaty: Oplaty | null;
  filtr: FiltrOplat;
  loading: boolean;
  error: string | null;
}

const initialState: OplatyState = {
  oplaty: null,
  filtr: 'all',
  loading: false,
  error: null,
};

const oplatySlice = createSlice({
  name: 'oplaty',
  initialState,
  reducers: {
    setFiltr: (state, action: PayloadAction<FiltrOplat>) => {
      state.filtr = action.payload;
    },
    wyczyscBlad: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOplaty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOplaty.fulfilled, (state, action) => {
        state.loading = false;
        state.oplaty = action.payload;
      })
      .addCase(fetchOplaty.rejected, (state, action) => {
        state.loading = false;
        state.oplaty = null;
        state.error = action.error.message || 'Nie udało się pobrać opłat';
      });
  },
});

export const { setFiltr, wyczyscBlad } = oplatySlice.actions;
export default oplatySlice.reducer;
