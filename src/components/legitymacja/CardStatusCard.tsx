// karta stanu legitymacji - wydana / zamówiona / brak, terminy,
// numer MLS i dostępność kodów.
import React from 'react';
import { Icon } from '@iconify/react';

import { Badge } from '@/components/common';
import type { Legitymacja } from '@/types/legitymacja';

interface CardStatusCardProps {
  legitymacja: Legitymacja;
}

const STATUSY: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
  Draft: { label: 'przygotowywane', variant: 'default' },
  Queued: { label: 'w kolejce MLS', variant: 'info' },
  Submitted: { label: 'wysłane do MLS', variant: 'info' },
  Processing: { label: 'przetwarzane', variant: 'warning' },
  Ready: { label: 'gotowa do pobrania', variant: 'success' },
  Revoked: { label: 'unieważniona', variant: 'danger' },
  Error: { label: 'błąd', variant: 'danger' },
};

export const CardStatusCard: React.FC<CardStatusCardProps> = ({ legitymacja }) => {
  const status = STATUSY[legitymacja.status || ''] || {
    label: legitymacja.status || 'brak zamówienia',
    variant: 'default' as const,
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">Legitymacja mLegitymacja</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Dokument mobilny w aplikacji mObywatel. Plastikowa legitymacja wydawana jest osobno
            w dziekanacie.
          </p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-400">Zamówienie</dt>
          <dd className="text-slate-800">{legitymacja.zamowienie || '—'}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-400">Rodzaj</dt>
          <dd className="text-slate-800">
            {legitymacja.rodzaj === 'Renewal'
              ? 'przedłużenie'
              : legitymacja.rodzaj === 'Issue'
              ? 'wydanie'
              : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-400">Ważna od</dt>
          <dd className="text-slate-800">{legitymacja.wazna_od || '—'}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-400">Ważna do</dt>
          <dd className="text-slate-800">{legitymacja.wazna_do || '—'}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-400">Numer MLS</dt>
          <dd className="text-slate-800">{legitymacja.numer_mls || '—'}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-400">Zamówiono</dt>
          <dd className="text-slate-800">{legitymacja.zamowiono || '—'}</dd>
        </div>
      </dl>

      {legitymacja.blad && (
        <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-rose-50 px-2 py-1.5 text-[11px] text-rose-800">
          <Icon icon="mdi:alert-circle-outline" fontSize={14} className="mt-0.5" />
          <span>{legitymacja.blad}</span>
        </div>
      )}

      {legitymacja.termin_qr && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
          <Icon icon="mdi:qrcode" fontSize={14} />
          kod QR ważny do: {legitymacja.termin_qr}
        </p>
      )}

      {legitymacja.kody_dostepne && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-700">
          <Icon icon="mdi:check-decagram-outline" fontSize={14} />
          kody są gotowe do odebrania
        </p>
      )}
    </div>
  );
};

export default CardStatusCard;
