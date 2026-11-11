// Siatka ocen wykładowcy - wybór grupy i planu oceniania,
// wpisanie punktów za kryteria i zapis (wersja robocza albo zatwierdzenie).
// Dane: /v1/edu/oceny/grupa (GET/POST) w hubie.
import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';

import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchGrid,
  fetchGroups,
  saveGrades,
  setGrupa,
  setPlan,
  setPunkt,
  wyczyscBlad,
  wyczyscZapis,
} from '@/store/oceny';
import { ConfirmDialog, EmptyState, LoadingSpinner } from '@/components/common';
import { GradesGrid, GroupsSidebar, PlanSelector } from '@/components/oceny';

export default function OcenyPage() {
  const dispatch = useAppDispatch();
  const {
    groups,
    grupa,
    plany,
    studenci,
    planId,
    punkty,
    groupsLoading,
    gridLoading,
    saving,
    error,
    zapisane,
  } = useAppSelector((state) => state.oceny);

  const [potwierdzenie, setPotwierdzenie] = useState<null | 'draft' | 'submit'>(null);

  const plan = useMemo(() => plany.find((item) => item.id === planId) || null, [plany, planId]);
  const czyCosWpisane = useMemo(
    () => Object.values(punkty).some((kryteria) => Object.keys(kryteria).length > 0),
    [punkty]
  );

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    if (!grupa) return;
    dispatch(fetchGrid(grupa));
  }, [dispatch, grupa]);

  const zmienGrupe = (nowaGrupa: string) => {
    if (czyCosWpisane && !window.confirm('Masz niewysłane oceny. Zmienić grupę?')) {
      return;
    }
    dispatch(wyczyscBlad());
    dispatch(setGrupa(nowaGrupa));
  };

  const zapisz = async (zatwierdz: boolean) => {
    setPotwierdzenie(null);
    try {
      await dispatch(saveGrades({ zatwierdz })).unwrap();
      if (grupa) dispatch(fetchGrid(grupa));
    } catch {
      // komunikat błędu trafia do stanu slice'a
    }
  };

  return (
    <>
      <Head>
        <title>Oceny - siatka wykładowcy | Galwork Edu</title>
      </Head>

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Oceny - siatka wykładowcy</h1>
          <p className="mt-1 text-xs text-slate-500">
            Wybierz grupę i plan oceniania, wpisz punkty za kryteria i zapisz wynik.
            Ocena końcowa i zaliczenie są liczone po stronie dziekanatu (Frappe).
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
            <Icon icon="mdi:alert-circle-outline" fontSize={16} className="mt-0.5" />
            <p className="flex-1">{error}</p>
            <button
              type="button"
              className="rounded-lg border border-rose-200 bg-white px-2 py-1 font-medium text-rose-700 hover:bg-rose-100"
              onClick={() => {
                dispatch(wyczyscBlad());
                dispatch(fetchGroups());
                if (grupa) dispatch(fetchGrid(grupa));
              }}
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {zapisane !== null && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            <Icon icon="mdi:check-circle-outline" fontSize={16} />
            <span className="flex-1">Zapisano oceny: {zapisane}.</span>
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
          <GroupsSidebar
            groups={groups}
            grupa={grupa}
            loading={groupsLoading}
            onSelect={zmienGrupe}
          />

          <div className="space-y-3">
            {!grupa && (
              <EmptyState
                icon="mdi:account-group-outline"
                title="Wybierz grupę"
                description="Z listy po lewej wybierz grupę, dla której wpisujesz oceny."
              />
            )}

            {grupa && gridLoading && <LoadingSpinner message="Ładowanie siatki ocen..." />}

            {grupa && !gridLoading && plany.length === 0 && (
              <EmptyState
                icon="mdi:clipboard-text-off-outline"
                title="Brak planów oceniania"
                description="Dla tej grupy nie ma jeszcze planu oceniania (Assessment Plan) w dziekanacie."
              />
            )}

            {grupa && !gridLoading && plany.length > 0 && plan && (
              <>
                <PlanSelector
                  plany={plany}
                  planId={planId}
                  onChange={(id) => {
                    if (czyCosWpisane && !window.confirm('Masz niewysłane oceny. Zmienić plan?')) {
                      return;
                    }
                    dispatch(setPlan(id));
                  }}
                />

                <GradesGrid
                  plan={plan}
                  studenci={studenci}
                  punkty={punkty}
                  onChange={(student, kryterium, wartosc) =>
                    dispatch(setPunkt({ student, kryterium, wartosc }))
                  }
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] text-slate-500">
                    Zapis tworzy/aktualizuje Assessment Result w Frappe; zatwierdzenie
                    wystawia wynik ostatecznie.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={saving || !czyCosWpisane}
                      onClick={() => setPotwierdzenie('draft')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <Icon icon="mdi:content-save-outline" fontSize={16} />
                      Zapisz wersję roboczą
                    </button>
                    <button
                      type="button"
                      disabled={saving || !czyCosWpisane}
                      onClick={() => setPotwierdzenie('submit')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      <Icon icon="mdi:check-decagram" fontSize={16} />
                      Zapisz i zatwierdź
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={potwierdzenie !== null}
        onClose={() => setPotwierdzenie(null)}
        onConfirm={() => zapisz(potwierdzenie === 'submit')}
        title={potwierdzenie === 'submit' ? 'Zatwierdzić oceny?' : 'Zapisać wersję roboczą?'}
        message={
          potwierdzenie === 'submit'
            ? 'Wyniki zostaną zatwierdzone w dziekanacie. Po zatwierdzeniu edycja nie jest już możliwa.'
            : 'Wyniki zostaną zapisane jako wersja robocza - będzie można je jeszcze poprawić.'
        }
        confirmText={potwierdzenie === 'submit' ? 'Zatwierdź' : 'Zapisz'}
        variant={potwierdzenie === 'submit' ? 'warning' : 'primary'}
        loading={saving}
      />
    </>
  );
}
