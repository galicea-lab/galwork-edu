// stan ekranu legitymacji - pobranie stanu, odświeżenie,
// zamówienie/przedłużenie i wniosek o unieważnienie. Kody QR nie przechodzą
// przez Redux (jednorazowy odczyt trzyma komponent).
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { legitymacjaApi, ZamowienieParams } from '@/api/legitymacja';
import type { Legitymacja } from '@/types/legitymacja';
// numer albumu z sesji (student - własny, dziekanat - wybrany).
import { SesjaDoZapytan, AlbumZapytania, albumZapytania } from '@/utils/sesja';

/** Numer albumu z sesji albo błąd do pokazania na ekranie. */
function albumLubBlad(sesja: SesjaDoZapytan): AlbumZapytania {
  const wynik = albumZapytania(sesja);
  if (wynik.blad) throw new Error(wynik.blad);
  return wynik;
}

export const fetchLegitymacja = createAsyncThunk<
  Legitymacja,
  void,
  { state: { sesja: SesjaDoZapytan } }
>('legitymacja/fetch', async (_param, { getState }) => {
  const { album } = albumLubBlad(getState().sesja);
  const response = await legitymacjaApi.getCard(album);
  if (response.code !== 0 || !response.legitymacja) {
    throw new Error(response.message || 'Nie udało się pobrać stanu legitymacji');
  }
  return response.legitymacja;
});

export const odswiezLegitymacje = createAsyncThunk<
  Legitymacja,
  void,
  { state: { sesja: SesjaDoZapytan } }
>('legitymacja/refresh', async (_param, { getState }) => {
  const { album } = albumLubBlad(getState().sesja);
  const response = await legitymacjaApi.refreshCard(album);
  if (response.code !== 0 || !response.legitymacja) {
    throw new Error(response.message || 'Nie udało się odświeżyć stanu legitymacji');
  }
  return response.legitymacja;
});

export const zamowLegitymacje = createAsyncThunk<
  void,
  ZamowienieParams,
  { state: { sesja: SesjaDoZapytan } }
>('legitymacja/order', async (params, { dispatch, getState }) => {
  const { album } = albumLubBlad(getState().sesja);
  const response = await legitymacjaApi.orderCard({ ...params, nr_albumu: album });
  if (response.code !== 0) {
    throw new Error(response.message || 'Nie udało się zamówić legitymacji');
  }
  await dispatch(fetchLegitymacja());
});

export const uniewaznijLegitymacje = createAsyncThunk<
  void,
  string | undefined,
  { state: { sesja: SesjaDoZapytan } }
>('legitymacja/revoke', async (powod, { dispatch, getState }) => {
  const { album } = albumLubBlad(getState().sesja);
  const response = await legitymacjaApi.revokeCard(powod, album);
  if (response.code !== 0) {
    throw new Error(response.message || 'Nie udało się zgłosić unieważnienia');
  }
  await dispatch(fetchLegitymacja());
});

interface LegitymacjaState {
  legitymacja: Legitymacja | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  info: string | null;
}

const initialState: LegitymacjaState = {
  legitymacja: null,
  loading: false,
  saving: false,
  error: null,
  info: null,
};

const legitymacjaSlice = createSlice({
  name: 'legitymacja',
  initialState,
  reducers: {
    wyczyscBlad: (state) => {
      state.error = null;
    },
    wyczyscInfo: (state) => {
      state.info = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLegitymacja.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLegitymacja.fulfilled, (state, action) => {
        state.loading = false;
        state.legitymacja = action.payload;
      })
      .addCase(fetchLegitymacja.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Nie udało się pobrać stanu legitymacji';
      })
      .addCase(odswiezLegitymacje.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(odswiezLegitymacje.fulfilled, (state, action) => {
        state.saving = false;
        state.legitymacja = action.payload;
        state.info = 'Stan legitymacji został odświeżony.';
      })
      .addCase(odswiezLegitymacje.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Nie udało się odświeżyć stanu legitymacji';
      })
      .addCase(zamowLegitymacje.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(zamowLegitymacje.fulfilled, (state) => {
        state.saving = false;
        state.info = 'Zamówienie legitymacji zostało przekazane do dziekanatu.';
      })
      .addCase(zamowLegitymacje.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Nie udało się zamówić legitymacji';
      })
      .addCase(uniewaznijLegitymacje.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(uniewaznijLegitymacje.fulfilled, (state) => {
        state.saving = false;
        state.info = 'Wniosek o unieważnienie legitymacji został zarejestrowany.';
      })
      .addCase(uniewaznijLegitymacje.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Nie udało się zgłosić unieważnienia';
      });
  },
});

export const { wyczyscBlad, wyczyscInfo } = legitymacjaSlice.actions;
export default legitymacjaSlice.reducer;
