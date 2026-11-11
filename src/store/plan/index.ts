// stan ekranu planu zajęć. Dwa tryby: plan studenta i plan
// wykładowcy; thunki wołają /v1/edu/plan i /v1/edu/plan/wykladowca (hub).
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { planApi } from '@/api/plan';
import type { KontekstWykladowcy, Plan, TrybPlanu, WpisPlanu } from '@/types/plan';
// plan studenta czyta numer albumu z sesji (dziekanat wskazuje
// studenta w nagłówku, student nie podaje nic).
import { SesjaDoZapytan, albumZapytania } from '@/utils/sesja';

export interface FetchPlanParams {
  tryb: TrybPlanu;
  od: string;
  do: string;
  kierunek?: string;
}

function bladPlanu(message: string): Error {
  return new Error(message || 'Nie udało się pobrać planu zajęć');
}

export const fetchPlan = createAsyncThunk<
  Plan,
  FetchPlanParams,
  { state: { sesja: SesjaDoZapytan } }
>('plan/fetch', async (params, { getState }) => {
  const { album, blad } = albumZapytania(getState().sesja);
  if (params.tryb !== 'wykladowca' && blad) throw new Error(blad);
  const response =
    params.tryb === 'wykladowca'
      ? await planApi.getLecturerPlan({ od: params.od, do: params.do })
      : await planApi.getPlan({
          od: params.od,
          do: params.do,
          kierunek: params.kierunek,
          nr_albumu: album,
        });

  if (response.code !== 0 || !response.plan) {
    throw bladPlanu(response.message);
  }
  return response.plan;
});

export const fetchKontekstWykladowcy = createAsyncThunk<KontekstWykladowcy | null>(
  'plan/kontekst',
  async () => {
    const response = await planApi.getLecturerContext();
    if (response.code !== 0) return null;
    return response.kontekst ?? null;
  }
);

interface PlanState {
  tryb: TrybPlanu;
  od: string;
  do: string;
  kierunek: string;
  wpisy: WpisPlanu[];
  wybrany: string | null;
  kontekst: KontekstWykladowcy | null;
  loading: boolean;
  error: string | null;
}

const initialState: PlanState = {
  tryb: 'student',
  od: '',
  do: '',
  kierunek: '',
  wpisy: [],
  wybrany: null,
  kontekst: null,
  loading: false,
  error: null,
};

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    setZakres: (state, action: PayloadAction<{ od: string; do: string }>) => {
      state.od = action.payload.od;
      state.do = action.payload.do;
    },
    setTryb: (state, action: PayloadAction<TrybPlanu>) => {
      state.tryb = action.payload;
      state.wybrany = null;
    },
    setKierunek: (state, action: PayloadAction<string>) => {
      state.kierunek = action.payload;
    },
    setWybrany: (state, action: PayloadAction<string | null>) => {
      state.wybrany = action.payload;
    },
    wyczyscBlad: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.wpisy = action.payload.wpisy || [];
      })
      .addCase(fetchPlan.rejected, (state, action) => {
        state.loading = false;
        state.wpisy = [];
        state.error = action.error.message || 'Nie udało się pobrać planu zajęć';
      })
      .addCase(fetchKontekstWykladowcy.fulfilled, (state, action) => {
        state.kontekst = action.payload;
      });
  },
});

export const { setZakres, setTryb, setKierunek, setWybrany, wyczyscBlad } = planSlice.actions;
export default planSlice.reducer;
