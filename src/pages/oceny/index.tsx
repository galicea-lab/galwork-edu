// Karta ocen studenta - przedmioty z oceną końcową i podejściami,
// średnia ważona ECTS oraz rozliczenie semestrów. Dane: GET /v1/edu/oceny
// (hub -> education.portal.api.get_grades).
import React, { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';

import { useAppDispatch, useAppSelector } from '@/store';
import { fetchKarta, setRok, setSemestr, wyczyscBlad } from '@/store/mojeOceny';
import { EmptyState, LoadingSpinner } from '@/components/common';
import { AverageSummary, CourseGradeCard, SemesterStatusList } from '@/components/moje-oceny';
import type { OcenaPrzedmiotu } from '@/types/oceny';

function wartosci(przedmioty: OcenaPrzedmiotu[], pole: 'rok_akademicki' | 'semestr'): string[] {
  return Array.from(
    new Set(przedmioty.map((item) => item[pole]).filter((wartosc): wartosc is string => Boolean(wartosc)))
  ).sort();
}

export default function MojeOcenyPage() {
  const dispatch = useAppDispatch();
  const { karta, rok, semestr, loading, error } = useAppSelector((state) => state.mojeOceny);

  useEffect(() => {
    dispatch(fetchKarta({}));
  }, [dispatch]);

  const przedmioty = useMemo(() => karta?.przedmioty || [], [karta]);
  const lata = useMemo(() => wartosci(przedmioty, 'rok_akademicki'), [przedmioty]);
  const semestry = useMemo(() => wartosci(przedmioty, 'semestr'), [przedmioty]);

  const filtrowane = useMemo(
    () =>
      przedmioty.filter(
        (item) =>
          (!rok || item.rok_akademicki === rok) && (!semestr || item.semestr === semestr)
      ),
    [przedmioty, rok, semestr]
  );

  return (
    <>
      <Head>
        <title>Moje oceny | Galwork Edu</title>
      </Head>

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Moje oceny</h1>
          <p className="mt-1 text-xs text-slate-500">
            Oceny końcowe przedmiotów, podejścia, średnia ważona ECTS i rozliczenie semestrów.
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
                dispatch(fetchKarta({}));
              }}
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {loading && <LoadingSpinner message="Ładowanie ocen..." />}

        {!loading && !error && karta && (
          <>
            <AverageSummary srednia={karta.srednia} progZaliczenia={karta.prog_zaliczenia} />

            {(lata.length > 1 || semestry.length > 1) && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                {lata.length > 1 && (
                  <label className="inline-flex items-center gap-2">
                    Rok akademicki
                    <select
                      value={rok}
                      onChange={(event) => dispatch(setRok(event.target.value))}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                    >
                      <option value="">wszystkie</option>
                      {lata.map((wartosc) => (
                        <option key={wartosc} value={wartosc}>
                          {wartosc}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {semestry.length > 1 && (
                  <label className="inline-flex items-center gap-2">
                    Semestr
                    <select
                      value={semestr}
                      onChange={(event) => dispatch(setSemestr(event.target.value))}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                    >
                      <option value="">wszystkie</option>
                      {semestry.map((wartosc) => (
                        <option key={wartosc} value={wartosc}>
                          {wartosc}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            )}

            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-800">
                Przedmioty {filtrowane.length < przedmioty.length ? `(${filtrowane.length} z ${przedmioty.length})` : ''}
              </h2>

              {filtrowane.length === 0 ? (
                <EmptyState
                  icon="mdi:clipboard-text-off-outline"
                  title="Brak ocen"
                  description={
                    przedmioty.length === 0
                      ? 'Nie masz jeszcze wystawionych ocen.'
                      : 'Dla wybranego roku/semestru nie ma ocen.'
                  }
                />
              ) : (
                filtrowane.map((ocena) => (
                  <CourseGradeCard key={`${ocena.przedmiot.code}-${ocena.rok_akademicki}-${ocena.semestr}`} ocena={ocena} />
                ))
              )}
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-800">Rozliczenie semestrów</h2>
              <SemesterStatusList semestry={karta.semestry} />
            </section>
          </>
        )}

        {!loading && !error && !karta && (
          <EmptyState
            icon="mdi:school-outline"
            title="Brak danych"
            description="Nie znaleziono karty ocen dla Twojego konta."
          />
        )}
      </div>
    </>
  );
}
