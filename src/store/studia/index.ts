// Stan ekranu "Moje studia".
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { studiaApi } from '@/api/studia';
import type { MojeStudia } from '@/types/studia';
// dziekanat i administrator wskazują studenta (nagłówek),
// student czyta własne dane - numer albumu bierze się z sesji.
import { SesjaDoZapytan, albumZapytania } from '@/utils/sesja';

export const fetchStudia = createAsyncThunk<MojeStudia, void, { state: { sesja: SesjaDoZapytan } }>(
  'studia/fetch',
  async (_param, { getState }) => {
    const { album, blad } = albumZapytania(getState().sesja);
    if (blad) throw new Error(blad);
    const response = await studiaApi.getStudies(album);
    if (response.code !== 0 || !response.studia) {
      throw new Error(response.message || 'Nie udało się pobrać danych o studiach');
    }
    return response.studia;
  }
);

interface StudiaState {
  studia: MojeStudia | null;
  loading: boolean;
  error: string | null;
}

const initialState: StudiaState = {
  studia: null,
  loading: false,
  error: null,
};

const studiaSlice = createSlice({
  name: 'studia',
  initialState,
  reducers: {
    wyczyscBlad: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudia.fulfilled, (state, action) => {
        state.loading = false;
        state.studia = action.payload;
      })
      .addCase(fetchStudia.rejected, (state, action) => {
        state.loading = false;
        state.studia = null;
        state.error = action.error.message || 'Nie udało się pobrać danych o studiach';
      });
  },
});

export const { wyczyscBlad } = studiaSlice.actions;
export default studiaSlice.reducer;
