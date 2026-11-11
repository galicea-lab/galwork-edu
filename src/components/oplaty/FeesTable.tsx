// tabela należności - termin z informacją o opóźnieniu, kwota,
// zaległość i stan. Sortowanie po terminie (rosnąco) albo kwocie (malejąco).
import React, { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';

import { Badge, EmptyState } from '@/components/common';
import type { Oplata, StanOplaty } from '@/types/oplaty';

interface FeesTableProps {
  oplaty: Oplata[];
}

const STANY: Record<StanOplaty, { label: string; variant: 'success' | 'info' | 'danger' }> = {
  paid: { label: 'zapłacone', variant: 'success' },
  due: { label: 'do zapłaty', variant: 'info' },
  overdue: { label: 'po terminie', variant: 'danger' },
};

type Sortowanie = 'termin' | 'kwota';

function kwota(wartosc: number, waluta?: string | null): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: waluta || 'PLN',
  }).format(wartosc || 0);
}

function dniPoTerminie(termin?: string | null): number | null {
  if (!termin) return null;
  const data = new Date(`${termin}T00:00:00`);
  if (Number.isNaN(data.getTime())) return null;
  const dzisiaj = new Date();
  dzisiaj.setHours(0, 0, 0, 0);
  const dni = Math.round((dzisiaj.getTime() - data.getTime()) / 86400000);
  return dni > 0 ? dni : null;
}

export const FeesTable: React.FC<FeesTableProps> = ({ oplaty }) => {
  const [sortowanie, setSortowanie] = useState<Sortowanie>('termin');

  const posortowane = useMemo(() => {
    const kopia = [...oplaty];
    if (sortowanie === 'kwota') {
      return kopia.sort((a, b) => b.zaleglosc - a.zaleglosc || b.kwota - a.kwota);
    }
    return kopia.sort((a, b) => (a.termin || '').localeCompare(b.termin || ''));
  }, [oplaty, sortowanie]);

  if (oplaty.length === 0) {
    return (
      <EmptyState
        icon="mdi:cash-check"
        title="Brak należności"
        description="Nie masz żadnych opłat w wybranym filtrze."
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end gap-2 text-xs text-slate-600">
        <label className="inline-flex items-center gap-2">
          Sortuj
          <select
            value={sortowanie}
            onChange={(event) => setSortowanie(event.target.value as Sortowanie)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
          >
            <option value="termin">według terminu</option>
            <option value="kwota">według kwoty</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Dokument</th>
              <th className="px-3 py-2 font-medium">Termin</th>
              <th className="px-3 py-2 text-right font-medium">Kwota</th>
              <th className="px-3 py-2 text-right font-medium">Zaległość</th>
              <th className="px-3 py-2 font-medium">Stan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posortowane.map((oplata) => {
              const stan = STANY[oplata.stan] || STANY.due;
              const dni = oplata.stan === 'overdue' ? dniPoTerminie(oplata.termin) : null;
              return (
                <tr key={oplata.id} className="hover:bg-slate-50/60">
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-800">{oplata.id}</p>
                    <p className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                      {oplata.kierunek && <span>{oplata.kierunek}</span>}
                      {oplata.rok_akademicki && <span>· {oplata.rok_akademicki}</span>}
                      {oplata.semestr && <span>· {oplata.semestr}</span>}
                      {oplata.data_wystawienia && <span>· wystawiono {oplata.data_wystawienia}</span>}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <p className={dni ? 'font-medium text-rose-700' : 'text-slate-700'}>
                      {oplata.termin || '—'}
                    </p>
                    {dni && (
                      <p className="flex items-center gap-1 text-[11px] text-rose-600">
                        <Icon icon="mdi:clock-alert-outline" fontSize={12} />
                        {dni} dni po terminie
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-800">
                    {kwota(oplata.kwota, oplata.waluta)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-medium ${
                      oplata.zaleglosc > 0 ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {kwota(oplata.zaleglosc, oplata.waluta)}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={stan.variant}>{stan.label}</Badge>
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

export default FeesTable;
