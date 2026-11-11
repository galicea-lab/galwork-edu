// ekran "Moje studia" - dane osobowe, zapisy na kierunek,
// rozliczenie semestrów i aktualny semestr. Dane: GET /v1/edu/studia
// (hub -> education.portal.api.get_studies).
import React, { useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';

import { useAppDispatch, useAppSelector } from '@/store';
import { fetchStudia, wyczyscBlad } from '@/store/studia';
import { Badge, LoadingSpinner } from '@/components/common';
import { StudentProfileCard, StudiesList } from '@/components/studia';

const STATUSY: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
  Passed: { label: 'zaliczony', variant: 'success' },
  'Conditional Pass': { label: 'warunkowo', variant: 'warning' },
  Failed: { label: 'niezaliczony', variant: 'danger' },
  Closed: { label: 'zamknięty', variant: 'info' },
  Active: { label: 'w toku', variant: 'default' },
  Suspended: { label: 'wstrzymany', variant: 'danger' },
};

export default function MojeStudiaPage() {
  const dispatch = useAppDispatch();
  const { studia, loading, error } = useAppSelector((state) => state.studia);

  useEffect(() => {
    dispatch(fetchStudia());
  }, [dispatch]);

  const zapis = studia?.aktualny_zapis;
  const semestr = studia?.aktualny_semestr;
  const status = STATUSY[semestr?.status || ''] || null;

  return (
    <>
      <Head>
        <title>Moje studia | Galwork Edu</title>
      </Head>

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Moje studia</h1>
          <p className="mt-1 text-xs text-slate-500">
            Dane osobowe, kierunek i tryb studiów, zapisy oraz rozliczenie semestrów.
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
                dispatch(fetchStudia());
              }}
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {loading && <LoadingSpinner message="Ładowanie danych o studiach..." />}

        {!loading && studia && (
          <>
            {(zapis || semestr) && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2 text-xs text-blue-900">
                <Icon icon="mdi:school-outline" fontSize={16} />
                {zapis && (
                  <span className="font-medium">
                    {zapis.kierunek_nazwa || zapis.kierunek}
                    {zapis.kierunek_skrot ? ` (${zapis.kierunek_skrot})` : ''}
                  </span>
                )}
                {semestr?.nr_semestru && (
                  <>
                    <span className="text-blue-500">·</span>
                    <span>semestr {semestr.nr_semestru}{semestr.letni ? ' letni' : ''}</span>
                  </>
                )}
                {status && <Badge variant={status.variant}>{status.label}</Badge>}
                {semestr?.zaplacony !== undefined && (
                  <Badge variant={semestr.zaplacony ? 'success' : 'warning'}>
                    {semestr.zaplacony ? 'semestr opłacony' : 'semestr nieopłacony'}
                  </Badge>
                )}
              </div>
            )}

            <StudentProfileCard student={studia.student} />
            <StudiesList zapisy={studia.zapisy} semestry={studia.semestry} />
          </>
        )}
      </div>
    </>
  );
}
