// Ekran frekwencji - zakładka studenta (podsumowanie i
// nieobecności) oraz zakładka wykładowcy (lista obecności grupy na dany dzień).
// Dane: /v1/edu/frekwencja* (hub -> education.portal.api.*).
import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';

import { useAppDispatch, useAppSelector } from '@/store';
import { fetchFrekwencja, wyczyscBlad } from '@/store/frekwencja';
import {
  fetchGrupyWykladowcy,
  fetchLista,
  setData,
  setGrupa,
  ustawStatus,
  ustawWszystkich,
  wyczyscZapis,
  zapiszListe,
} from '@/store/listaObecnosci';
import { EmptyState, LoadingSpinner } from '@/components/common';
import { AttendanceSummary, MarkingGrid } from '@/components/frekwencja';
// rola decyduje o domyślnym widoku (własna frekwencja albo lista obecności prowadzonej grupy).
import { useAktywnaRola } from '@/hooks/useSesja';

type Tryb = 'student' | 'wykladowca';

export default function FrekwencjaPage() {
  const dispatch = useAppDispatch();
  const student = useAppSelector((state) => state.frekwencja);
  const lecturer = useAppSelector((state) => state.listaObecnosci);
  const rola = useAktywnaRola();
  // rola ustala dostępny widok; wybór użytkownika 
  // jest tylko dodatkiem, więc tryb liczymy w trakcie renderu, bez efektów.
  const tryby: Tryb[] = rola === 'wykladowca' ? ['wykladowca'] : ['student'];
  const [wybranyTryb, setWybranyTryb] = useState<Tryb | null>(null);
  const tryb: Tryb = wybranyTryb && tryby.includes(wybranyTryb) ? wybranyTryb : tryby[0];
  const setTryb = setWybranyTryb;

  useEffect(() => {
    dispatch(fetchFrekwencja());
  }, [dispatch]);

  useEffect(() => {
    if (tryb !== 'wykladowca') return;
    if (lecturer.grupy.length === 0) dispatch(fetchGrupyWykladowcy());
  }, [dispatch, tryb, lecturer.grupy.length]);

  useEffect(() => {
    if (!lecturer.grupa) return;
    dispatch(fetchLista({ grupa: lecturer.grupa, data: lecturer.data }));
  }, [dispatch, lecturer.grupa, lecturer.data]);

  const zmienione = useMemo(
    () =>
      Object.values(lecturer.statusy).filter((status) => status !== null && status !== undefined)
        .length,
    [lecturer.statusy]
  );

  const zmienGrupe = (grupa: string) => {
    if (
      lecturer.zapisane === null &&
      zmienione > 0 &&
      !window.confirm('Masz nieoznaczone zmiany. Zmienić grupę?')
    ) {
      return;
    }
    dispatch(wyczyscBlad());
    dispatch(setGrupa(grupa));
  };

  const zmienDate = (data: string) => {
    if (!data) return;
    dispatch(setData(data));
  };

  const zapisz = async () => {
    try {
      await dispatch(zapiszListe()).unwrap();
      dispatch(fetchLista({ grupa: lecturer.grupa, data: lecturer.data }));
    } catch {
      // błąd trafia do stanu slice'a
    }
  };

  return (
    <>
      <Head>
        <title>Frekwencja | Galwork Edu</title>
      </Head>

      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Frekwencja</h1>
            <p className="mt-1 text-xs text-slate-500">
              {tryb === 'student'
                ? 'Twoja frekwencja z zajęć, podsumowanie per grupa i lista nieobecności'
                : 'Lista obecności grupy - oznacz studentów i zapisz'}
            </p>
          </div>

          <div
            className={`flex items-center gap-1 rounded-lg bg-slate-100 p-1 ${tryby.length > 1 ? '' : 'hidden'}`}
          >
            {(
              [
                { key: 'student', label: 'Moja frekwencja', icon: 'mdi:account-school-outline' },
                { key: 'wykladowca', label: 'Lista obecności', icon: 'mdi:human-male-board' },
              ] as Array<{ key: Tryb; label: string; icon: string }>
            )
              .filter((zakladka) => tryby.includes(zakladka.key))
              .map((zakladka) => (
                <button
                  key={zakladka.key}
                  type="button"
                  onClick={() => setTryb(zakladka.key)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    tryb === zakladka.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon icon={zakladka.icon} fontSize={16} />
                  {zakladka.label}
                </button>
              ))}
          </div>
        </div>

        {tryb === 'student' && (
          <>
            {student.error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                <Icon icon="mdi:alert-circle-outline" fontSize={16} className="mt-0.5" />
                <p className="flex-1">{student.error}</p>
                <button
                  type="button"
                  className="rounded-lg border border-rose-200 bg-white px-2 py-1 font-medium text-rose-700 hover:bg-rose-100"
                  onClick={() => {
                    dispatch(wyczyscBlad());
                    dispatch(fetchFrekwencja());
                  }}
                >
                  Spróbuj ponownie
                </button>
              </div>
            )}

            {student.loading && <LoadingSpinner message="Ładowanie frekwencji..." />}

            {!student.loading && student.frekwencja && (
              <AttendanceSummary frekwencja={student.frekwencja} />
            )}
          </>
        )}

        {tryb === 'wykladowca' && (
          <>
            {lecturer.error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                <Icon icon="mdi:alert-circle-outline" fontSize={16} className="mt-0.5" />
                <p className="flex-1">{lecturer.error}</p>
              </div>
            )}

            {lecturer.zapisane !== null && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                <Icon icon="mdi:check-circle-outline" fontSize={16} />
                <span className="flex-1">Zapisano obecność: {lecturer.zapisane}.</span>
                <button
                  type="button"
                  className="rounded-lg border border-emerald-200 bg-white px-2 py-1 font-medium text-emerald-700 hover:bg-emerald-100"
                  onClick={() => dispatch(wyczyscZapis())}
                >
                  OK
                </button>
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-[16rem,1fr]">
              <aside className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <h2 className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Moje grupy
                </h2>
                {lecturer.grupy.length === 0 && (
                  <p className="px-2 py-3 text-xs text-slate-400">
                    Brak grup - konto nie jest powiązane z żadną grupą studencką.
                  </p>
                )}
                <ul className="space-y-1">
                  {lecturer.grupy.map((grupa) => (
                    <li key={grupa.name}>
                      <button
                        type="button"
                        onClick={() => zmienGrupe(grupa.name)}
                        className={`w-full rounded-lg px-2 py-1.5 text-left text-xs transition ${
                          lecturer.grupa === grupa.name
                            ? 'bg-blue-50 text-blue-800 ring-1 ring-blue-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-medium">
                          <Icon icon="mdi:account-group-outline" fontSize={14} />
                          {grupa.student_group_name || grupa.name}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                          {grupa.course && <span>{grupa.course}</span>}
                          {typeof grupa.students === 'number' && <span>{grupa.students} os.</span>}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    Data
                    <input
                      type="date"
                      value={lecturer.data}
                      onChange={(event) => zmienDate(event.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                    />
                  </label>

                  {lecturer.dataZamrozenia && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
                      <Icon icon="mdi:snowflake-alert" fontSize={13} />
                      frekwencja zamrożona do {lecturer.dataZamrozenia}
                    </span>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">oznaczono {zmienione}</span>
                    <button
                      type="button"
                      disabled={lecturer.saving || zmienione === 0 || !lecturer.grupa}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                      onClick={zapisz}
                    >
                      <Icon icon="mdi:content-save-outline" fontSize={16} />
                      {lecturer.saving ? 'Zapisywanie...' : 'Zapisz obecność'}
                    </button>
                  </div>
                </div>

                {!lecturer.grupa && (
                  <EmptyState
                    icon="mdi:account-group-outline"
                    title="Wybierz grupę"
                    description="Z listy po lewej wybierz grupę, dla której oznaczasz obecność."
                  />
                )}

                {lecturer.grupa && lecturer.loading && (
                  <LoadingSpinner message="Ładowanie listy obecności..." />
                )}

                {lecturer.grupa && !lecturer.loading && (
                  <MarkingGrid
                    wpisy={lecturer.wpisy}
                    statusy={lecturer.statusy}
                    onStatus={(studentName, status) =>
                      dispatch(ustawStatus({ student: studentName, status }))
                    }
                    onWszyscy={(status) => dispatch(ustawWszystkich(status))}
                    disabled={lecturer.saving}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
