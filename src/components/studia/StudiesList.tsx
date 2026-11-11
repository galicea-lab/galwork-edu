// Karty zapisów na kierunek i rozliczenie semestrów.
import React from 'react';
import { Icon } from '@iconify/react';

import { Badge, EmptyState } from '@/components/common';
import type { StatusSemestru, ZapisNaKierunek } from '@/types/studia';

interface StudiesListProps {
  zapisy: ZapisNaKierunek[];
  semestry: StatusSemestru[];
}

const STATUSY: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
  Passed: { label: 'zaliczony', variant: 'success' },
  'Conditional Pass': { label: 'warunkowo', variant: 'warning' },
  Failed: { label: 'niezaliczony', variant: 'danger' },
  Closed: { label: 'zamknięty', variant: 'info' },
  Active: { label: 'w toku', variant: 'default' },
  Suspended: { label: 'wstrzymany', variant: 'danger' },
};

export const StudiesList: React.FC<StudiesListProps> = ({ zapisy, semestry }) => {
  if (zapisy.length === 0) {
    return (
      <EmptyState
        icon="mdi:school-outline"
        title="Brak zapisów na kierunek"
        description="Dziekanat nie ma jeszcze aktywnego zapisu na kierunek."
      />
    );
  }

  return (
    <div className="space-y-3">
      {zapisy.map((zapis) => (
        <div key={zapis.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {zapis.kierunek_nazwa || zapis.kierunek}
                {zapis.kierunek_skrot ? ` (${zapis.kierunek_skrot})` : ''}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                {zapis.stopien && <span>{zapis.stopien}</span>}
                {zapis.tryb && <span>· {zapis.tryb}</span>}
                {zapis.rok_akademicki && <span>· {zapis.rok_akademicki}</span>}
                {zapis.semestr && <span>· {zapis.semestr}</span>}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={zapis.platne ? 'warning' : 'success'}>
                {zapis.platne ? 'studia płatne' : 'studia bezpłatne'}
              </Badge>
              {zapis.data_zapisu && <Badge variant="default">zapis {zapis.data_zapisu}</Badge>}
            </div>
          </div>

          <p className="mt-2 flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500">
            {zapis.grupa && (
              <span className="inline-flex items-center gap-1">
                <Icon icon="mdi:account-group-outline" fontSize={13} />
                grupa {zapis.grupa}
              </span>
            )}
            {zapis.kategoria && (
              <span className="inline-flex items-center gap-1">
                <Icon icon="mdi:tag-outline" fontSize={13} />
                {zapis.kategoria}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Icon icon="mdi:identifier" fontSize={13} />
              {zapis.id}
            </span>
          </p>
        </div>
      ))}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <Icon icon="mdi:calendar-check-outline" fontSize={15} className="text-slate-400" />
          Rozliczenie semestrów
        </h3>

        {semestry.length === 0 ? (
          <p className="text-[11px] text-slate-500">Dziekanat nie wystawił jeszcze statusu semestru.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-xs">
            {semestry.map((semestr) => {
              const status = STATUSY[semestr.status || ''] || {
                label: semestr.status || 'brak statusu',
                variant: 'default' as const,
              };
              return (
                <li key={semestr.id} className="flex flex-wrap items-center justify-between gap-2 py-1.5">
                  <span className="text-slate-700">
                    {semestr.nr_semestru ? `Semestr ${semestr.nr_semestru}` : 'Semestr'}
                    {semestr.letni ? ' (letni)' : ''}
                    {semestr.rok_akademicki ? ` · ${semestr.rok_akademicki}` : ''}
                    {semestr.semestr ? ` · ${semestr.semestr}` : ''}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {semestr.data_decyzji && (
                      <span className="text-[11px] text-slate-400">decyzja {semestr.data_decyzji}</span>
                    )}
                    {semestr.do_sredniej ? <Badge variant="info">do średniej</Badge> : null}
                    <Badge variant={semestr.zaplacony ? 'success' : 'warning'}>
                      {semestr.zaplacony ? 'opłacony' : 'nieopłacony'}
                    </Badge>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudiesList;
