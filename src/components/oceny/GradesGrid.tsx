// siatka ocen - wiersz na studenta, kolumna na kryterium planu;
// suma i procent liczone w przeglądarce tylko do podglądu (ocenę końcową
// wylicza Frappe przy zapisie, z Grading Scale).
import React from 'react';
import { Icon } from '@iconify/react';

import type { PlanOceniania, StudentGrupy } from '@/types/oceny';

interface GradesGridProps {
  plan: PlanOceniania;
  studenci: StudentGrupy[];
  punkty: Record<string, Record<string, string>>;
  onChange: (student: string, kryterium: string, wartosc: string) => void;
}

function sumaStudenta(punkty: Record<string, string> | undefined): number {
  if (!punkty) return 0;
  return Object.values(punkty).reduce((suma, wartosc) => {
    const liczba = Number(wartosc);
    return suma + (Number.isFinite(liczba) ? liczba : 0);
  }, 0);
}

export const GradesGrid: React.FC<GradesGridProps> = ({ plan, studenci, punkty, onChange }) => {
  const maksimum = plan.maksimum || plan.kryteria.reduce((sum, item) => sum + item.maksimum, 0);

  if (studenci.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
        Grupa nie ma aktywnych studentów.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-xs">
        <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2 font-medium">Student</th>
            {plan.kryteria.map((kryterium) => (
              <th key={kryterium.kryterium} className="px-2 py-2 text-center font-medium">
                {kryterium.kryterium}
                <span className="ml-1 font-normal text-slate-400">/{kryterium.maksimum}</span>
              </th>
            ))}
            <th className="px-3 py-2 text-right font-medium">Suma</th>
            <th className="px-3 py-2 text-right font-medium">%</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {studenci.map((student) => {
            const suma = sumaStudenta(punkty[student.student]);
            const procent = maksimum > 0 ? Math.round((suma / maksimum) * 1000) / 10 : 0;
            return (
              <tr key={student.student} className="hover:bg-slate-50/60">
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    {student.zdjecie ? (
                      <img
                        src={student.zdjecie}
                        alt=""
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Icon icon="mdi:account" fontSize={14} />
                      </span>
                    )}
                    <div>
                      <p className="font-medium text-slate-800">{student.nazwisko || student.student}</p>
                      <p className="text-[11px] text-slate-500">
                        {student.nr_albumu ? `nr ${student.nr_albumu}` : student.student}
                        {student.nr_w_grupie ? ` · poz. ${student.nr_w_grupie}` : ''}
                      </p>
                    </div>
                  </div>
                </td>

                {plan.kryteria.map((kryterium) => {
                  const wartosc = punkty[student.student]?.[kryterium.kryterium] ?? '';
                  const zaDuzo = Number(wartosc) > kryterium.maksimum;
                  return (
                    <td key={kryterium.kryterium} className="px-2 py-1.5 text-center">
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={kryterium.maksimum}
                        step="0.5"
                        value={wartosc}
                        placeholder="–"
                        onChange={(event) =>
                          onChange(student.student, kryterium.kryterium, event.target.value)
                        }
                        className={`w-16 rounded-lg border px-1.5 py-1 text-center ${
                          zaDuzo
                            ? 'border-rose-300 bg-rose-50 text-rose-700'
                            : 'border-slate-200 bg-white text-slate-800'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </td>
                  );
                })}

                <td className="px-3 py-1.5 text-right font-medium text-slate-800">
                  {suma}
                  <span className="text-slate-400">/{maksimum}</span>
                </td>
                <td className="px-3 py-1.5 text-right text-slate-600">{procent}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GradesGrid;
