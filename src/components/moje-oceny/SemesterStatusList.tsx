// rozliczenie semestrów (Student Academic Status) - status,
// płatność i data decyzji dziekanatu.
import React from 'react';
import { Icon } from '@iconify/react';

import { Badge, EmptyState } from '@/components/common';
import type { SemestrStatus } from '@/types/oceny';

interface SemesterStatusListProps {
  semestry: SemestrStatus[];
}

const STATUSY: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
  Passed: { label: 'zaliczony', variant: 'success' },
  'Conditional Pass': { label: 'zaliczony warunkowo', variant: 'warning' },
  Failed: { label: 'niezaliczony', variant: 'danger' },
  Closed: { label: 'zamknięty', variant: 'info' },
  Active: { label: 'w toku', variant: 'default' },
  Suspended: { label: 'wstrzymany', variant: 'danger' },
};

export const SemesterStatusList: React.FC<SemesterStatusListProps> = ({ semestry }) => {
  if (semestry.length === 0) {
    return (
      <EmptyState
        icon="mdi:calendar-question"
        title="Brak rozliczonych semestrów"
        description="Dziekanat nie wystawił jeszcze statusu semestru."
      />
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {semestry.map((semestr) => {
        const status = STATUSY[semestr.status || ''] || { label: semestr.status || 'brak statusu', variant: 'default' as const };
        return (
          <div key={semestr.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-800">
                {semestr.nr_semestru ? `Semestr ${semestr.nr_semestru}` : 'Semestr'}
                {semestr.letni ? ' (letni)' : ''}
              </p>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {[semestr.rok_akademicki, semestr.semestr].filter(Boolean).join(' · ') || '—'}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              <Badge
                variant={semestr.zaplacony ? 'success' : 'warning'}
                icon={<Icon icon={semestr.zaplacony ? 'mdi:cash-check' : 'mdi:cash-clock'} fontSize={12} />}
              >
                {semestr.zaplacony ? 'opłacony' : 'nieopłacony'}
              </Badge>
              {semestr.do_sredniej ? <Badge variant="info">do średniej</Badge> : null}
              {semestr.data_decyzji && (
                <span className="text-slate-400">decyzja: {semestr.data_decyzji}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SemesterStatusList;
