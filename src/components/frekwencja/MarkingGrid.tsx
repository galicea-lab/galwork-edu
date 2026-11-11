// lista obecności grupy - oznaczenie obecny/nieobecny/urlop
// jednym kliknięciem, szybka akcja "wszyscy obecni".
import React from 'react';
import { Icon } from '@iconify/react';

import { EmptyState } from '@/components/common';
import type { StatusObecnosci, WpisObecnosci } from '@/types/frekwencja';

interface MarkingGridProps {
  wpisy: WpisObecnosci[];
  statusy: Record<string, StatusObecnosci | null>;
  onStatus: (student: string, status: StatusObecnosci | null) => void;
  onWszyscy: (status: StatusObecnosci) => void;
  disabled?: boolean;
}

const OPCJE: Array<{ status: StatusObecnosci; label: string; skrot: string; aktywny: string }> = [
  { status: 'Present', label: 'obecny', skrot: 'O', aktywny: 'bg-emerald-600 text-white border-emerald-600' },
  { status: 'Absent', label: 'nieobecny', skrot: 'N', aktywny: 'bg-rose-600 text-white border-rose-600' },
  { status: 'Leave', label: 'urlop', skrot: 'U', aktywny: 'bg-sky-600 text-white border-sky-600' },
];

export const MarkingGrid: React.FC<MarkingGridProps> = ({
  wpisy,
  statusy,
  onStatus,
  onWszyscy,
  disabled = false,
}) => {
  if (wpisy.length === 0) {
    return (
      <EmptyState
        icon="mdi:account-group-outline"
        title="Grupa bez studentów"
        description="Ta grupa nie ma aktywnych studentów albo lista nie została jeszcze pobrana."
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-slate-600">
        <button
          type="button"
          disabled={disabled}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
          onClick={() => onWszyscy('Present')}
        >
          <Icon icon="mdi:checkbox-multiple-marked-outline" fontSize={14} />
          wszyscy obecni
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Student</th>
              <th className="px-3 py-2 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {wpisy.map((wpis) => {
              const status = statusy[wpis.student] ?? null;
              return (
                <tr key={wpis.student} className="hover:bg-slate-50/60">
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      {wpis.zdjecie ? (
                        <img src={wpis.zdjecie} alt="" className="h-6 w-6 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <Icon icon="mdi:account" fontSize={14} />
                        </span>
                      )}
                      <div>
                        <p className="font-medium text-slate-800">{wpis.nazwisko || wpis.student}</p>
                        <p className="text-[11px] text-slate-500">
                          {wpis.nr_albumu ? `nr ${wpis.nr_albumu}` : wpis.student}
                          {wpis.nr_w_grupie ? ` · poz. ${wpis.nr_w_grupie}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center justify-center gap-1">
                      {OPCJE.map((opcja) => {
                        const wybrany = status === opcja.status;
                        return (
                          <button
                            key={opcja.status}
                            type="button"
                            disabled={disabled}
                            title={opcja.label}
                            onClick={() => onStatus(wpis.student, wybrany ? null : opcja.status)}
                            className={`h-7 w-9 rounded-lg border text-[11px] font-semibold transition disabled:opacity-50 ${
                              wybrany
                                ? opcja.aktywny
                                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {opcja.skrot}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarkingGrid;
