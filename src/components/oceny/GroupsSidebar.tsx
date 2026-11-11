// lista grup wykładowcy (kontekst z /v1/edu/plan/wykladowca/kontekst).
import React from 'react';
import { Icon } from '@iconify/react';

import type { GrupaWykladowcy } from '@/types/plan';

interface GroupsSidebarProps {
  groups: GrupaWykladowcy[];
  grupa: string;
  loading: boolean;
  onSelect: (grupa: string) => void;
}

export const GroupsSidebar: React.FC<GroupsSidebarProps> = ({
  groups,
  grupa,
  loading,
  onSelect,
}) => {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <h2 className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Moje grupy
      </h2>

      {loading && groups.length === 0 && (
        <p className="px-2 py-3 text-xs text-slate-400">Ładowanie grup...</p>
      )}

      {!loading && groups.length === 0 && (
        <p className="px-2 py-3 text-xs text-slate-400">
          Brak grup - konto nie jest powiązane z żadną grupą studencką.
        </p>
      )}

      <ul className="space-y-1">
        {groups.map((item) => (
          <li key={item.name}>
            <button
              type="button"
              onClick={() => onSelect(item.name)}
              className={`w-full rounded-lg px-2 py-1.5 text-left text-xs transition ${
                grupa === item.name
                  ? 'bg-blue-50 text-blue-800 ring-1 ring-blue-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Icon icon="mdi:account-group-outline" fontSize={14} />
                {item.student_group_name || item.name}
              </span>
              <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                {item.course && <span>{item.course}</span>}
                {typeof item.students === 'number' && <span>{item.students} os.</span>}
                {item.academic_term && <span>{item.academic_term}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default GroupsSidebar;
