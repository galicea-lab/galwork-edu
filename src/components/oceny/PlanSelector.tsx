// wybór planu oceniania (kolokwium/egzamin) w siatce ocen grupy.
import React from 'react';
import { Icon } from '@iconify/react';

import { Badge } from '@/components/common';
import type { PlanOceniania } from '@/types/oceny';

interface PlanSelectorProps {
  plany: PlanOceniania[];
  planId: string;
  onChange: (planId: string) => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({ plany, planId, onChange }) => {
  const plan = plany.find((item) => item.id === planId);

  if (plany.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          Plan oceniania
          <select
            value={planId}
            onChange={(event) => onChange(event.target.value)}
            className="min-w-64 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800"
          >
            {plany.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nazwa || item.id}
                {item.przedmiot ? ` · ${item.przedmiot}` : ''}
              </option>
            ))}
          </select>
        </label>

        {plan && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            {plan.przedmiot && <Badge variant="default">{plan.przedmiot}</Badge>}
            {plan.skala && (
              <Badge variant="info" icon={<Icon icon="mdi:scale-balance" fontSize={12} />}>
                {plan.skala}
              </Badge>
            )}
            <Badge variant="primary" icon={<Icon icon="mdi:sigma" fontSize={12} />}>
              maks. {plan.maksimum}
            </Badge>
            {plan.data && (
              <Badge variant="default" icon={<Icon icon="mdi:calendar" fontSize={12} />}>
                {plan.data}
              </Badge>
            )}
            <Badge variant={plan.zatwierdzony ? 'success' : 'warning'}>
              {plan.zatwierdzony ? 'zatwierdzony' : 'wersja robocza'}
            </Badge>
            <Badge variant="purple" icon={<Icon icon="mdi:check-decagram-outline" fontSize={12} />}>
              wystawione: {plan.wystawione}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanSelector;
