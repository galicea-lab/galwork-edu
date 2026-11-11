// Stan frekwencji studenta (/v1/edu/frekwencja).
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { frekwencjaApi } from '@/api/frekwencja';
import type { FrekwencjaStudenta } from '@/types/frekwencja';
// numer albumu z sesji (student - własny, dziekanat - wybrany).
import { SesjaDoZapytan, albumZapytania } from '@/utils/sesja';

export const fetchFrekwencja = createAsyncThunk<
  FrekwencjaStudenta,
  void,
  { state: { sesja: SesjaDoZapytan } }
>('frekwencja/fetch', async (_param, { getState }) => {
  const { album, blad } = albumZapytania(getState().sesja);
  if (blad) throw new Error(blad);
  const response = await frekwencjaApi.getAttendance({ nr_albumu: album });
  // student bez zajęć dostaje `frekwencja: null` - pusta frekwencja to nie błąd.
  if (response.code !== 0) {
    throw new Error(response.message || 'Nie udało się pobrać frekwencji');
  }
  return (
    response.frekwencja || {
      student: '',
      ogolem: { obecny: 0, nieobecny: 0, procent: null },
      grupy: [],
      nieobecnosci: [],
    }
  );
});

interface FrekwencjaState {
  frekwencja: FrekwencjaStudenta | null;
  loading: boolean;
  error: string | null;
}

const initialState: FrekwencjaState = {
  frekwencja: null,
  loading: false,
  error: null,
};

const frekwencjaSlice = createSlice({
  name: 'frekwencja',
  initialState,
  reducers: {
    wyczyscBlad: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFrekwencja.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFrekwencja.fulfilled, (state, action) => {
        state.loading = false;
        state.frekwencja = action.payload;
      })
      .addCase(fetchFrekwencja.rejected, (state, action) => {
        state.loading = false;
        state.frekwencja = null;
        state.error = action.error.message || 'Nie udało się pobrać frekwencji';
      });
  },
});

export const { wyczyscBlad } = frekwencjaSlice.actions;
export default frekwencjaSlice.reducer;
