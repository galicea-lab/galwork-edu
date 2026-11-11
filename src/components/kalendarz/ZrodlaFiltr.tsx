// 2026-11-10: filtr źródeł kalendarza - przełączniki z kolorem, liczbą
// zdarzeń i stanem źródła (nie dotyczy / błąd).
import React from 'react';
import { Icon } from '@iconify/react';

import type { StatusZrodla, ZrodloId, ZrodloInfo } from '@/types/kalendarz';
import { kolorZrodla } from '@/utils/kalendarz';

interface ZrodlaFiltrProps {
  zrodla: ZrodloInfo[];
  statusy: StatusZrodla[];
  ukryte: Set<ZrodloId>;
  onPrzelacz: (id: ZrodloId) => void;
}

export const ZrodlaFiltr: React.FC<ZrodlaFiltrProps> = ({ zrodla, statusy, ukryte, onPrzelacz }) => {
  const statusZrodla = new Map(statusy.map((s) => [s.id, s]));

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Źródła kalendarza">
      {zrodla.map((zrodlo) => {
        const status = statusZrodla.get(zrodlo.id);
        const widoczne = !ukryte.has(zrodlo.id);
        const niedotyczy = status && !status.dotyczy;
        const blad = status && status.dotyczy && !status.ok;
        return (
          <button
            key={zrodlo.id}
            type="button"
            aria-pressed={widoczne}
            disabled={niedotyczy}
            title={blad ? status.komunikat : niedotyczy ? 'Nie dotyczy tej roli' : zrodlo.opis}
            onClick={() => onPrzelacz(zrodlo.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              widoczne && !niedotyczy
                ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                : 'border-slate-200 bg-slate-50 text-slate-400'
            } disabled:cursor-not-allowed`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: widoczne && !niedotyczy ? kolorZrodla(zrodlo.id) : '#cbd5e1' }}
            />
            {zrodlo.nazwa}
            {blad ? (
              <Icon icon="mdi:alert-circle-outline" fontSize={14} className="text-rose-600" />
            ) : status?.dotyczy ? (
              <span className="rounded-full bg-slate-100 px-1.5 text-[10px] text-slate-500">
                {status.liczba}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

export default ZrodlaFiltr;
