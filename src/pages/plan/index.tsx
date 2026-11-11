// ekran planu zajęć - tydzień studenta albo wykładowcy zależnie
// od zakładki; dane z /v1/edu/plan* (hub -> education.portal.api.get_schedule).
import React, { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';

import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchKontekstWykladowcy,
  fetchPlan,
  setKierunek,
  setTryb,
  setWybrany,
  setZakres,
  wyczyscBlad,
} from '@/store/plan';
import { EmptyState, LoadingSpinner } from '@/components/common';
import { PlanEntryModal, PlanGrid, PlanToolbar } from '@/components/plan';
// rola decyduje, czyj plan jest domyślny (student czy wykładowca).
import { useAktywnaRola } from '@/hooks/useSesja';
import type { TrybPlanu } from '@/types/plan';
import { addDays, kierunkiPlanu, parseIsoDate, startOfWeek, toIsoDate } from '@/utils/plan';
import { pobierzIcs } from '@/utils/ics';

export default function PlanPage() {
  const dispatch = useAppDispatch();
  const {
    tryb,
    od,
    do: doDaty,
    kierunek,
    wpisy,
    wybrany,
    kontekst,
    loading,
    error,
  } = useAppSelector((state) => state.plan);

  const rola = useAktywnaRola();
  // Wykładowca widzi swój plan prowadzonych grup, pozostali - własny plan zajęć.
  const tryby = useMemo<TrybPlanu[]>(
    () => (rola === 'wykladowca' ? ['wykladowca'] : ['student']),
    [rola]
  );

  const wybranyWpis = useMemo(
    () => wpisy.find((wpis) => wpis.id === wybrany) || null,
    [wpisy, wybrany]
  );
  const kierunki = useMemo(() => kierunkiPlanu(wpisy), [wpisy]);

  // pierwsze wejście: zakres = bieżący tydzień
  useEffect(() => {
    if (od && doDaty) return;
    const start = startOfWeek(new Date());
    dispatch(setZakres({ od: toIsoDate(start), do: toIsoDate(addDays(start, 6)) }));
  }, [dispatch, od, doDaty]);

  // tryb planu wynika z roli - po ustaleniu roli przełączamy raz.
  useEffect(() => {
    if (!tryby.includes(tryb)) dispatch(setTryb(tryby[0]));
  }, [dispatch, tryby, tryb]);

  // pobranie planu przy zmianie tygodnia, trybu lub filtra kierunku
  useEffect(() => {
    if (!od || !doDaty) return;
    dispatch(fetchPlan({ tryb, od, do: doDaty, kierunek: kierunek || undefined }));
  }, [dispatch, tryb, od, doDaty, kierunek]);

  useEffect(() => {
    if (tryb === 'wykladowca' && !kontekst) {
      dispatch(fetchKontekstWykladowcy());
    }
  }, [dispatch, tryb, kontekst]);

  const zmienTydzien = (offset: number) => {
    const start = addDays(parseIsoDate(od), offset * 7);
    dispatch(setZakres({ od: toIsoDate(start), do: toIsoDate(addDays(start, 6)) }));
  };

  const dzisiaj = () => {
    const start = startOfWeek(new Date());
    dispatch(setZakres({ od: toIsoDate(start), do: toIsoDate(addDays(start, 6)) }));
  };

  const zmienTryb = (nowy: TrybPlanu) => {
    dispatch(wyczyscBlad());
    dispatch(setTryb(nowy));
    if (nowy === 'student') dispatch(setKierunek(''));
  };

  const eksportuj = () => {
    const zakres = `${od}_${doDaty}`;
    pobierzIcs(wpisy, `Plan zajęć ${zakres}`, `plan-zajec-${zakres}.ics`);
  };

  const nazwaPlanu = tryb === 'wykladowca' ? 'Plan wykładowcy' : 'Plan zajęć';

  return (
    <>
      <Head>
        <title>{nazwaPlanu} | Galwork Edu</title>
      </Head>

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{nazwaPlanu}</h1>
          <p className="mt-1 text-xs text-slate-500">
            {tryb === 'wykladowca'
              ? 'Zajęcia grup, które prowadzisz w wybranym tygodniu'
              : 'Twoje zajęcia w wybranym tygodniu - grupy, do których jesteś zapisany'}
          </p>
        </div>

        <PlanToolbar
          tryby={tryby}
          tryb={tryb}
          od={od}
          doDaty={doDaty}
          kierunek={kierunek}
          kierunki={kierunki}
          loading={loading}
          czyJestPlan={wpisy.length > 0}
          onPrev={() => zmienTydzien(-1)}
          onNext={() => zmienTydzien(1)}
          onToday={dzisiaj}
          onTrybChange={zmienTryb}
          onKierunekChange={(wartosc) => dispatch(setKierunek(wartosc))}
          onExport={eksportuj}
          onRefresh={() =>
            dispatch(fetchPlan({ tryb, od, do: doDaty, kierunek: kierunek || undefined }))
          }
        />

        {tryb === 'wykladowca' && kontekst?.groups?.length ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2 text-xs text-blue-800">
            <Icon icon="mdi:account-tie-outline" fontSize={16} />
            <span className="font-medium">
              {kontekst.instructor?.instructor_name || 'Wykładowca'}
            </span>
            <span className="text-blue-600">·</span>
            <span>{kontekst.groups.length} grup</span>
            {kontekst.academic_term && (
              <>
                <span className="text-blue-600">·</span>
                <span>semestr {kontekst.academic_term}</span>
              </>
            )}
          </div>
        ) : null}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
            <Icon icon="mdi:alert-circle-outline" fontSize={16} className="mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Nie udało się pobrać planu</p>
              <p className="mt-0.5">{error}</p>
              {tryb === 'wykladowca' && (
                <p className="mt-1 text-rose-700">
                  Sprawdź, czy Twoje konto jest powiązane z rekordem wykładowcy (Instructor).
                </p>
              )}
            </div>
            <button
              type="button"
              className="rounded-lg border border-rose-200 bg-white px-2 py-1 font-medium text-rose-700 hover:bg-rose-100"
              onClick={() =>
                dispatch(fetchPlan({ tryb, od, do: doDaty, kierunek: kierunek || undefined }))
              }
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {loading && <LoadingSpinner message="Ładowanie planu zajęć..." />}

        {!loading && !error && wpisy.length === 0 && (
          <EmptyState
            icon="mdi:calendar-blank-outline"
            title="Brak zajęć w tym tygodniu"
            description={
              tryb === 'wykladowca'
                ? 'Nie masz zaplanowanych zajęć w wybranym tygodniu albo nie prowadzisz jeszcze żadnej grupy.'
                : 'Nie masz zaplanowanych zajęć w wybranym tygodniu.'
            }
          />
        )}

        {!loading && wpisy.length > 0 && (
          <PlanGrid wpisy={wpisy} od={od} onSelect={(wpis) => dispatch(setWybrany(wpis.id))} />
        )}
      </div>

      <PlanEntryModal wpis={wybranyWpis} onClose={() => dispatch(setWybrany(null))} />
    </>
  );
}
