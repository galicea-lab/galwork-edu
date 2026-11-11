// stan listy obecności wykładowcy - grupy z kontekstu,
// lista na dany dzień i zapis statusów (idempotentny per student i datę).
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { frekwencjaApi } from '@/api/frekwencja';
import { planApi } from '@/api/plan';
import type { GrupaWykladowcy } from '@/types/plan';
import type { StatusObecnosci, WpisObecnosci } from '@/types/frekwencja';

export const fetchGrupyWykladowcy = createAsyncThunk<GrupaWykladowcy[]>(
  'listaObecnosci/grupy',
  async () => {
    const response = await planApi.getLecturerContext();
    if (response.code !== 0) {
      throw new Error(response.message || 'Nie udało się pobrać grup wykładowcy');
    }
    return response.kontekst?.groups ?? [];
  }
);

export const fetchLista = createAsyncThunk<
  { wpisy: WpisObecnosci[]; dataZamrozenia: string | null; data: string },
  { grupa: string; data: string }
>('listaObecnosci/fetch', async (params) => {
  const response = await frekwencjaApi.getGroupAttendance({ grupa: params.grupa, data: params.data });
  if (response.code !== 0 || !response.lista) {
    throw new Error(response.message || 'Nie udało się pobrać listy obecności');
  }
  return {
    wpisy: response.lista.wpisy || [],
    dataZamrozenia: response.lista.data_zamrozenia ?? null,
    data: response.lista.data || params.data,
  };
});

export const zapiszListe = createAsyncThunk<
  number,
  void,
  { state: { listaObecnosci: ListaObecnosciState } }
>('listaObecnosci/save', async (_arg, { getState }) => {
  const state = getState().listaObecnosci;
  const wpisy = Object.entries(state.statusy)
    .filter(([, status]) => Boolean(status))
    .map(([student, status]) => ({ student, status: status as StatusObecnosci }));

  if (wpisy.length === 0) {
    throw new Error('Nie oznaczono żadnego studenta');
  }

  const response = await frekwencjaApi.saveGroupAttendance({
    grupa: state.grupa,
    data: state.data,
    wpisy,
  });
  if (response.code !== 0 || !response.wynik) {
    throw new Error(response.message || 'Nie udało się zapisać listy obecności');
  }
  return response.wynik.zapisane.length;
});

export interface ListaObecnosciState {
  grupy: GrupaWykladowcy[];
  grupa: string;
  data: string;
  wpisy: WpisObecnosci[];
  statusy: Record<string, StatusObecnosci | null>;
  dataZamrozenia: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  zapisane: number | null;
}

function dzisiaj(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

const initialState: ListaObecnosciState = {
  grupy: [],
  grupa: '',
  data: dzisiaj(),
  wpisy: [],
  statusy: {},
  dataZamrozenia: null,
  loading: false,
  saving: false,
  error: null,
  zapisane: null,
};

const listaObecnosciSlice = createSlice({
  name: 'listaObecnosci',
  initialState,
  reducers: {
    setGrupa: (state, action: PayloadAction<string>) => {
      state.grupa = action.payload;
      state.wpisy = [];
      state.statusy = {};
      state.zapisane = null;
    },
    setData: (state, action: PayloadAction<string>) => {
      state.data = action.payload;
      state.zapisane = null;
    },
    ustawStatus: (
      state,
      action: PayloadAction<{ student: string; status: StatusObecnosci | null }>
    ) => {
      const { student, status } = action.payload;
      state.statusy[student] = status;
      state.zapisane = null;
    },
    ustawWszystkich: (state, action: PayloadAction<StatusObecnosci>) => {
      const status = action.payload;
      for (const wpis of state.wpisy) {
        state.statusy[wpis.student] = status;
      }
      state.zapisane = null;
    },
    wyczyscBlad: (state) => {
      state.error = null;
    },
    wyczyscZapis: (state) => {
      state.zapisane = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGrupyWykladowcy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGrupyWykladowcy.fulfilled, (state, action) => {
        state.loading = false;
        state.grupy = action.payload;
      })
      .addCase(fetchGrupyWykladowcy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Nie udało się pobrać grup wykładowcy';
      })
      .addCase(fetchLista.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLista.fulfilled, (state, action) => {
        state.loading = false;
        state.wpisy = action.payload.wpisy;
        state.dataZamrozenia = action.payload.dataZamrozenia;
        state.data = action.payload.data;
        state.statusy = {};
        for (const wpis of action.payload.wpisy) {
          state.statusy[wpis.student] = wpis.status ?? null;
        }
        state.zapisane = null;
      })
      .addCase(fetchLista.rejected, (state, action) => {
        state.loading = false;
        state.wpisy = [];
        state.error = action.error.message || 'Nie udało się pobrać listy obecności';
      })
      .addCase(zapiszListe.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(zapiszListe.fulfilled, (state, action) => {
        state.saving = false;
        state.zapisane = action.payload;
      })
      .addCase(zapiszListe.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Nie udało się zapisać listy obecności';
      });
  },
});

export const { setGrupa, setData, ustawStatus, ustawWszystkich, wyczyscBlad, wyczyscZapis } =
  listaObecnosciSlice.actions;
export default listaObecnosciSlice.reducer;
