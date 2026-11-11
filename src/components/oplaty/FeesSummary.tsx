// podsumowanie należności - do zapłaty, po terminie i zapłacone.
import React from 'react';
import { Icon } from '@iconify/react';

import type { Oplaty } from '@/types/oplaty';

interface FeesSummaryProps {
  oplaty: Oplaty;
}

function kwota(wartosc: number, waluta = 'PLN'): string {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: waluta }).format(
    wartosc || 0
  );
}

export const FeesSummary: React.FC<FeesSummaryProps> = ({ oplaty }) => {
  const waluta = oplaty.oplaty[0]?.waluta || 'PLN';

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">Do zapłaty</p>
        <p
          className={`mt-1 text-2xl font-bold ${
            oplaty.suma_zaleglosci > 0 ? 'text-slate-900' : 'text-emerald-700'
          }`}
        >
          {kwota(oplaty.suma_zaleglosci, waluta)}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {oplaty.wymaga_zaplaty ? 'masz nieuregulowane należności' : 'wszystko uregulowane'}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">Po terminie</p>
        <p
          className={`mt-1 text-2xl font-bold ${
            oplaty.suma_przeterminowana > 0 ? 'text-rose-700' : 'text-slate-900'
          }`}
        >
          {kwota(oplaty.suma_przeterminowana, waluta)}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
          {oplaty.suma_przeterminowana > 0 && (
            <Icon icon="mdi:alert-outline" fontSize={13} className="text-rose-600" />
          )}
          {oplaty.suma_przeterminowana > 0
            ? 'skontaktuj się z dziekanatem'
            : 'brak przeterminowanych należności'}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">Zapłacone</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {kwota(oplaty.suma_zaplacona, waluta)}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {oplaty.oplaty.length} dokumentów płatności
        </p>
      </div>
    </div>
  );
};

export default FeesSummary;
