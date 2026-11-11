import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// ** Slices
import processModels from './processModels';
import processInstances from './processInstances';
import tasks from './tasks';
import comments from './comments';
import notifications from './notifications';
import jform from './jform';
import plan from './plan';
import oceny from './oceny';
import mojeOceny from './mojeOceny';
import legitymacja from './legitymacja';
import oplaty from './oplaty';
import frekwencja from './frekwencja';
import listaObecnosci from './listaObecnosci';
import studia from './studia';
// I 2026-11-10: rola użytkownika i kontekst studenta (menu, zapytania API).
import sesja from './sesja';

export const store = configureStore({
  reducer: {
    processModels,
    processInstances,
    tasks,
    comments,
    notifications,
    jform,
    plan,
    oceny,
    mojeOceny,
    legitymacja,
    oplaty,
    frekwencja,
    listaObecnosci,
    studia,
    sesja
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

// Use throughout app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
