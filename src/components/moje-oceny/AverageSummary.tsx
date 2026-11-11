// podsumowanie karty ocen - średnia ważona ECTS, liczba
// przedmiotów i informacja o progu zaliczenia.
import React from 'react';
import { Icon } from '@iconify/react';

import { Badge } from '@/components/common';
import type { SredniaOcen } from '@/types/oceny';

interface AverageSummaryProps {
  srednia: SredniaOcen;
  progZaliczenia: number;
}

export const AverageSummary: React.FC<AverageSummaryProps> = ({ srednia, progZaliczenia }) => {
  const wartosc = srednia.wartosc;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">Średnia (ważona ECTS)</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {wartosc === null || wartosc === undefined ? '–' : wartosc.toFixed(2)}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">{srednia.przedmioty} przedmiotów z oceną</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">Zaliczenia</p>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="success" icon={<Icon icon="mdi:check-decagram-outline" fontSize={12} />}>
            zaliczone: {srednia.zaliczone}
          </Badge>
          <Badge variant="danger" icon={<Icon icon="mdi:close-octagon-outline" fontSize={12} />}>
            niezaliczone: {srednia.niezaliczone}
          </Badge>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">Próg zaliczenia</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{progZaliczenia}%</p>
        <p className="mt-0.5 text-[11px] text-slate-500">ocena poniżej progu to brak zaliczenia</p>
      </div>
    </div>
  );
};

export default AverageSummary;
