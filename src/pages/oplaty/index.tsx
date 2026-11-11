// ekran opłat studenta - należności, terminy, zaległości i stan.
// Płatność online nie jest częścią tego ekranu (brak bramki płatniczej):
// należności opłaca się przelewem, a stan aktualizuje dziekanat.
// Dane: GET /v1/edu/oplaty (hub -> education.portal.api.get_fees).
import React, { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';

import { useAppDispatch, useAppSelector } from '@/store';
import { fetchOplaty, setFiltr, wyczyscBlad, type FiltrOplat } from '@/store/oplaty';
import { EmptyState, LoadingSpinner } from '@/components/common';
import { FeesSummary, FeesTable } from '@/components/oplaty';

const FILTRY: { key: FiltrOplat; label: string }[] = [
  { key: 'all', label: 'wszystkie' },
  { key: 'due', label: 'do zapłaty' },
  { key: 'overdue', label: 'po terminie' },
  { key: 'paid', label: 'zapłacone' },
];

export default function OplatyPage() {
  const dispatch = useAppDispatch();
  const { oplaty, filtr, loading, error } = useAppSelector((state) => state.oplaty);

  useEffect(() => {
    dispatch(fetchOplaty());
  }, [dispatch]);

  const widoczne = useMemo(() => {
    const wszystkie = oplaty?.oplaty || [];
    if (filtr === 'all') return wszystkie;
    return wszystkie.filter((item) => item.stan === filtr);
  }, [oplaty, filtr]);

  return (
    <>
      <Head>
        <title>Opłaty | Galwork Edu</title>
      </Head>

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Opłaty</h1>
          <p className="mt-1 text-xs text-slate-500">
            Należności, terminy płatności i stan rozliczenia. Opłaty wnosisz przelewem - po
            zaksięgowaniu dziekanat aktualizuje stan, który widzisz poniżej.
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
                dispatch(fetchOplaty());
              }}
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {loading && <LoadingSpinner message="Ładowanie opłat..." />}

        {!loading && !error && oplaty && (
          <>
            <FeesSummary oplaty={oplaty} />

            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
              {FILTRY.map((pozycja) => (
                <button
                  key={pozycja.key}
                  type="button"
                  onClick={() => dispatch(setFiltr(pozycja.key))}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    filtr === pozycja.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {pozycja.label}
                </button>
              ))}
            </div>

            <FeesTable oplaty={widoczne} />

            <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-500">
              <Icon icon="mdi:information-outline" fontSize={15} className="mt-0.5 text-slate-400" />
              <p>
                Numer rachunku do przelewu i tytuł płatności otrzymasz w dziekanacie (albo w
                korespondencji z dziekanatem). Płatność online nie jest jeszcze dostępna w serwisie.
              </p>
            </div>
          </>
        )}

        {!loading && !error && !oplaty && (
          <EmptyState
            icon="mdi:cash-multiple"
            title="Brak danych o opłatach"
            description="Nie znaleziono należności dla Twojego konta."
          />
        )}
      </div>
    </>
  );
}
