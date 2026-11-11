// pasek narzędzi planu zajęć - nawigacja po tygodniach, tryb
// (student/wykładowca), filtr kierunku i eksport do kalendarza.
import React from 'react';
import { Icon } from '@iconify/react';

import type { TrybPlanu } from '@/types/plan';
import { formatZakres } from '@/utils/plan';

interface PlanToolbarProps {
  /** Tryby dostępne w bieżącej roli; przy jednym zakładki się nie pokazują. */
  tryby?: TrybPlanu[];
  tryb: TrybPlanu;
  od: string;
  doDaty: string;
  kierunek: string;
  kierunki: string[];
  loading: boolean;
  czyJestPlan: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onTrybChange: (tryb: TrybPlanu) => void;
  onKierunekChange: (kierunek: string) => void;
  onExport: () => void;
  onRefresh: () => void;
}

const przycisk =
  'inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50';

export const PlanToolbar: React.FC<PlanToolbarProps> = ({
  tryby,
  tryb,
  od,
  doDaty,
  kierunek,
  kierunki,
  loading,
  czyJestPlan,
  onPrev,
  onNext,
  onToday,
  onTrybChange,
  onKierunekChange,
  onExport,
  onRefresh,
}) => {
  const wszystkie: { key: TrybPlanu; label: string; icon: string }[] = [
    { key: 'student', label: 'Plan studenta', icon: 'mdi:account-school-outline' },
    { key: 'wykladowca', label: 'Plan wykładowcy', icon: 'mdi:human-male-board' },
  ];
  // 2026-11-10: pokazujemy tylko tryby dozwolone w aktywnej roli.
  const zakladki = tryby ? wszystkie.filter((zakladka) => tryby.includes(zakladka.key)) : wszystkie;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className={`flex items-center gap-1 rounded-lg bg-slate-100 p-1 ${zakladki.length > 1 ? '' : 'hidden'}`}
        >
          {zakladki.map((zakladka) => (
            <button
              key={zakladka.key}
              type="button"
              onClick={() => onTrybChange(zakladka.key)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                tryb === zakladka.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon icon={zakladka.icon} fontSize={16} />
              {zakladka.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className={przycisk} onClick={onPrev} title="Poprzedni tydzień">
            <Icon icon="mdi:chevron-left" fontSize={16} />
          </button>
          <button type="button" className={przycisk} onClick={onToday}>
            Dziś
          </button>
          <button type="button" className={przycisk} onClick={onNext} title="Następny tydzień">
            <Icon icon="mdi:chevron-right" fontSize={16} />
          </button>
          <span className="ml-1 text-xs font-medium text-slate-600">
            {formatZakres(od, doDaty)}
          </span>
          <button
            type="button"
            className={przycisk}
            onClick={onRefresh}
            disabled={loading}
            title="Odśwież plan"
          >
            <Icon icon="mdi:refresh" fontSize={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {tryb === 'student' && kierunki.length > 1 && (
          <label className="inline-flex items-center gap-2 text-xs text-slate-600">
            Kierunek
            <select
              value={kierunek}
              onChange={(event) => onKierunekChange(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
            >
              <option value="">wszystkie</option>
              {kierunki.map((nazwa) => (
                <option key={nazwa} value={nazwa}>
                  {nazwa}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          className={przycisk}
          onClick={onExport}
          disabled={!czyJestPlan}
          title="Pobierz plan jako plik kalendarza (.ics)"
        >
          <Icon icon="mdi:calendar-arrow-right" fontSize={16} />
          Eksport do kalendarza
        </button>
      </div>
    </div>
  );
};

export default PlanToolbar;
