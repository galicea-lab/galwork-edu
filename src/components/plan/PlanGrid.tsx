// tygodniowa siatka planu - 7 kolumn na desktopie, lista dni na
// telefonie (ten sam markup, tylko inna liczba kolumn).
import React from 'react';
import { Icon } from '@iconify/react';

import { Badge } from '@/components/common';
import type { WpisPlanu } from '@/types/plan';
import {
  DNI_TYGODNIA,
  formatDzien,
  grupujPoDniach,
  klasyKoloru,
  etykietaTypu,
  przytnijCzas,
  toIsoDate,
  addDays,
  parseIsoDate,
} from '@/utils/plan';

interface PlanGridProps {
  wpisy: WpisPlanu[];
  od: string;
  onSelect: (wpis: WpisPlanu) => void;
}

export const PlanGrid: React.FC<PlanGridProps> = ({ wpisy, od, onSelect }) => {
  const dni = grupujPoDniach(wpisy, od);
  const klucze = Object.keys(dni).sort();

  return (
    <div className="grid gap-3 md:grid-cols-7">
      {klucze.map((klucz, index) => {
        const dzien = parseIsoDate(klucz);
        const czyDzis = toIsoDate(new Date()) === klucz;
        return (
          <section
            key={klucz}
            className={`rounded-xl border p-2 ${
              czyDzis ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-white'
            }`}
          >
            <header className="mb-2 flex items-baseline justify-between gap-1 border-b border-slate-100 pb-1.5">
              <span
                className={`text-xs font-semibold ${czyDzis ? 'text-blue-700' : 'text-slate-700'}`}
              >
                {DNI_TYGODNIA[index]}
              </span>
              <span className="text-[11px] text-slate-500">{formatDzien(klucz)}</span>
            </header>

            <div className="space-y-2">
              {dni[klucz].length === 0 && (
                <p className="py-3 text-center text-[11px] text-slate-400">Brak zajęć</p>
              )}

              {dni[klucz].map((wpis) => {
                const typ = etykietaTypu(wpis.przedmiot?.type);
                return (
                  <button
                    key={wpis.id}
                    type="button"
                    onClick={() => onSelect(wpis)}
                    className={`w-full rounded-lg border border-slate-200 border-l-4 p-2 text-left transition hover:shadow-md ${klasyKoloru(
                      wpis.kolor
                    )}`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-slate-700">
                      <span>
                        {przytnijCzas(wpis.od)}–{przytnijCzas(wpis.do)}
                      </span>
                      {typ && <Badge variant="info" size="sm">{typ}</Badge>}
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-900">
                      {wpis.przedmiot?.name || wpis.przedmiot?.code}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                      {wpis.sala && (
                        <span className="inline-flex items-center gap-0.5">
                          <Icon icon="mdi:door" fontSize={12} />
                          {wpis.sala}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-0.5">
                        <Icon icon="mdi:account-group-outline" fontSize={12} />
                        {wpis.grupa}
                      </span>
                    </p>
                    {wpis.wykladowca && (
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">{wpis.wykladowca}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default PlanGrid;
