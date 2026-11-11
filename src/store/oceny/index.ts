// stan siatki ocen wykładowcy - grupy z kontekstu wykładowcy,
// siatka wybranej grupy i zapis ocen (wersja robocza albo zatwierdzenie).
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ocenyApi } from '@/api/oceny';
import { planApi } from '@/api/plan';
import type { GrupaWykladowcy } from '@/types/plan';
import type { PlanOceniania, StudentGrupy } from '@/types/oceny';

export const fetchGroups = createAsyncThunk<GrupaWykladowcy[]>('oceny/fetchGroups', async () => {
  const response = await planApi.getLecturerContext();
  if (response.code !== 0) {
    throw new Error(response.message || 'Nie udało się pobrać grup wykładowcy');
  }
  return response.kontekst?.groups ?? [];
});

export const fetchGrid = createAsyncThunk<
  { plany: PlanOceniania[]; studenci: StudentGrupy[]; planId: string },
  string
>('oceny/fetchGrid', async (grupa) => {
  const response = await ocenyApi.getGroupGrid(grupa);
  if (response.code !== 0) {
    throw new Error(response.message || 'Nie udało się pobrać siatki ocen');
  }
  const plany = response.plany || [];
  const planId = plany[0]?.id || '';

  // pierwszy plan wybieramy automatycznie - wykładowca zwykle wpisuje oceny
  // z jednego kolokwium/egzaminu
  return {
    plany,
    studenci: response.studenci || [],
    planId,
  };
});

export const saveGrades = createAsyncThunk<
  number,
  { zatwierdz: boolean },
  { state: { oceny: OcenyState } }
>('oceny/save', async (params, { getState }) => {
  const state = getState().oceny;
  const plan = state.plany.find((item) => item.id === state.planId);
  if (!plan) {
    throw new Error('Wybierz plan oceniania');
  }

  const wpisy = Object.entries(state.punkty)
    .map(([student, kryteria]) => {
      const punkty: Record<string, number> = {};
      let suma = 0;
      for (const [kryterium, wartosc] of Object.entries(kryteria)) {
        const liczba = Number(wartosc);
        if (!Number.isFinite(liczba) || wartosc === '') continue;
        punkty[kryterium] = liczba;
        suma += liczba;
      }
      return { student, punkty, suma };
    })
    .filter((wpis) => Object.keys(wpis.punkty).length > 0);

  if (wpisy.length === 0) {
    throw new Error('Nie wpisano żadnej oceny');
  }

  const response = await ocenyApi.saveGroupGrades({
    grupa: state.grupa,
    assessment_plan: state.planId,
    wpisy,
    zatwierdz: params.zatwierdz,
  });
  if (response.code !== 0 || !response.wynik) {
    throw new Error(response.message || 'Nie udało się zapisać ocen');
  }
  return response.wynik.count;
});

interface OcenyState {
  groups: GrupaWykladowcy[];
  grupa: string;
  plany: PlanOceniania[];
  studenci: StudentGrupy[];
  planId: string;
  punkty: Record<string, Record<string, string>>;
  groupsLoading: boolean;
  gridLoading: boolean;
  saving: boolean;
  error: string | null;
  zapisane: number | null;
}

const initialState: OcenyState = {
  groups: [],
  grupa: '',
  plany: [],
  studenci: [],
  planId: '',
  punkty: {},
  groupsLoading: false,
  gridLoading: false,
  saving: false,
  error: null,
  zapisane: null,
};

const ocenySlice = createSlice({
  name: 'oceny',
  initialState,
  reducers: {
    setGrupa: (state, action: PayloadAction<string>) => {
      state.grupa = action.payload;
      state.plany = [];
      state.studenci = [];
      state.planId = '';
      state.punkty = {};
      state.zapisane = null;
    },
    setPlan: (state, action: PayloadAction<string>) => {
      state.planId = action.payload;
      state.zapisane = null;
    },
    setPunkt: (
      state,
      action: PayloadAction<{ student: string; kryterium: string; wartosc: string }>
    ) => {
      const { student, kryterium, wartosc } = action.payload;
      state.zapisane = null;
      if (!state.punkty[student]) state.punkty[student] = {};
      if (wartosc === '') {
        delete state.punkty[student][kryterium];
        if (Object.keys(state.punkty[student]).length === 0) delete state.punkty[student];
        return;
      }
      state.punkty[student][kryterium] = wartosc;
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
      .addCase(fetchGroups.pending, (state) => {
        state.groupsLoading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.groupsLoading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.groupsLoading = false;
        state.error = action.error.message || 'Nie udało się pobrać grup wykładowcy';
      })
      .addCase(fetchGrid.pending, (state) => {
        state.gridLoading = true;
        state.error = null;
      })
      .addCase(fetchGrid.fulfilled, (state, action) => {
        state.gridLoading = false;
        state.plany = action.payload.plany;
        state.studenci = action.payload.studenci;
        state.planId = action.payload.planId;
        state.punkty = {};
      })
      .addCase(fetchGrid.rejected, (state, action) => {
        state.gridLoading = false;
        state.plany = [];
        state.studenci = [];
        state.error = action.error.message || 'Nie udało się pobrać siatki ocen';
      })
      .addCase(saveGrades.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveGrades.fulfilled, (state, action) => {
        state.saving = false;
        state.zapisane = action.payload;
      })
      .addCase(saveGrades.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || 'Nie udało się zapisać ocen';
      });
  },
});

export const { setGrupa, setPlan, setPunkt, wyczyscBlad, wyczyscZapis } = ocenySlice.actions;
export default ocenySlice.reducer;
