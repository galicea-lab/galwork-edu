// Podsumowanie frekwencji studenta - łączny procent i tabela grup.
import React from 'react';
import { Icon } from '@iconify/react';

import { Badge, EmptyState } from '@/components/common';
import type { FrekwencjaStudenta } from '@/types/frekwencja';

interface AttendanceSummaryProps {
  frekwencja: FrekwencjaStudenta;
}

function procentKolor(procent?: number | null): string {
  if (procent === null || procent === undefined) return 'text-slate-500';
  if (procent >= 80) return 'text-emerald-700';
  if (procent >= 50) return 'text-amber-700';
  return 'text-rose-700';
}

export const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ frekwencja }) => {
  const ogolem = frekwencja.ogolem;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Frekwencja</p>
          <p className={`mt-1 text-2xl font-bold ${procentKolor(ogolem.procent)}`}>
            {ogolem.procent === null || ogolem.procent === undefined ? '–' : `${ogolem.procent}%`}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">liczona z oznaczonych zajęć</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Obecności</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{ogolem.obecny}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Nieobecności</p>
          <p className="mt-1 text-2xl font-bold text-rose-700">{ogolem.nieobecny}</p>
        </div>
      </div>

      {frekwencja.grupy.length === 0 ? (
        <EmptyState
          icon="mdi:calendar-blank-outline"
          title="Brak oznaczonych zajęć"
          description="Nie ma jeszcze odnotowanej frekwencji z Twoich grup."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Grupa / przedmiot</th>
                <th className="px-3 py-2 text-right font-medium">Obecny</th>
                <th className="px-3 py-2 text-right font-medium">Nieobecny</th>
                <th className="px-3 py-2 text-right font-medium">Urlop</th>
                <th className="px-3 py-2 text-right font-medium">Frekwencja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {frekwencja.grupy.map((grupa) => (
                <tr key={grupa.grupa} className="hover:bg-slate-50/60">
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-800">{grupa.nazwa || grupa.grupa}</p>
                    <p className="text-[11px] text-slate-500">
                      {[grupa.przedmiot, grupa.grupa].filter(Boolean).join(' · ')}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-right text-emerald-700">{grupa.obecny}</td>
                  <td className="px-3 py-2 text-right text-rose-700">{grupa.nieobecny}</td>
                  <td className="px-3 py-2 text-right text-slate-600">{grupa.urlop}</td>
                  <td className={`px-3 py-2 text-right font-medium ${procentKolor(grupa.procent)}`}>
                    {grupa.procent === null || grupa.procent === undefined ? '–' : `${grupa.procent}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <Icon icon="mdi:calendar-remove-outline" fontSize={15} className="text-slate-400" />
          Nieobecności ({frekwencja.nieobecnosci.length})
        </h3>
        {frekwencja.nieobecnosci.length === 0 ? (
          <p className="text-[11px] text-slate-500">Brak odnotowanych nieobecności.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-xs">
            {frekwencja.nieobecnosci.map((nieobecnosc) => (
              <li key={`${nieobecnosc.data}-${nieobecnosc.zajecia || nieobecnosc.grupa}`} className="flex items-center justify-between gap-2 py-1.5">
                <span className="text-slate-700">
                  {nieobecnosc.data}
                  {nieobecnosc.grupa ? ` · ${nieobecnosc.grupa}` : ''}
                </span>
                <Badge variant={nieobecnosc.usprawiedliwiona ? 'success' : 'warning'}>
                  {nieobecnosc.usprawiedliwiona ? 'usprawiedliwiona' : 'nieusprawiedliwiona'}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AttendanceSummary;
