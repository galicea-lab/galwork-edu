// 2026-11-10: szczegóły zdarzenia kalendarza i odsyłacz do ekranu, z
// którego pochodzi (plan, opłaty, oceny, zadanie).
import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';

import { Modal } from '@/components/common';
import type { Zdarzenie } from '@/types/kalendarz';
import { kolorZdarzenia, kwota, opisTerminu } from '@/utils/kalendarz';

interface ZdarzenieModalProps {
  zdarzenie: Zdarzenie | null;
  nazwaZrodla?: string;
  onClose: () => void;
}

const Wiersz: React.FC<{ icon: string; label: string; value?: unknown }> = ({ icon, label, value }) =>
  value === undefined || value === null || value === '' ? null : (
    <div className="flex items-start gap-2 text-sm">
      <Icon icon={icon} fontSize={16} className="mt-0.5 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
        <p className="break-words text-slate-800">{String(value)}</p>
      </div>
    </div>
  );

const ODSYLACZ: Record<string, string> = {
  '/plan': 'Plan zajęć',
  '/oplaty': 'Opłaty',
  '/oceny': 'Oceny',
  '/frekwencja': 'Frekwencja',
};

function etykietaOdsylacza(ref: string): string {
  if (ref.startsWith('/tasks/')) return 'Przejdź do zadania';
  return `Przejdź: ${ODSYLACZ[ref] ?? ref}`;
}

/** Wiersze zależne od rodzaju zdarzenia. */
const Szczegoly: React.FC<{ zdarzenie: Zdarzenie }> = ({ zdarzenie }) => {
  const { typ, szczegoly: s } = zdarzenie.extendedProps;
  const przedmiot = (s.przedmiot ?? s.course) as { name?: string } | undefined;
  switch (typ) {
    case 'zajecia':
      return (
        <>
          <Wiersz icon="mdi:book-open-variant" label="Przedmiot" value={przedmiot?.name} />
          <Wiersz icon="mdi:account-group-outline" label="Grupa" value={s.grupa} />
          <Wiersz icon="mdi:account-tie-outline" label="Prowadzący" value={s.wykladowca} />
        </>
      );
    case 'exam':
      return (
        <>
          <Wiersz icon="mdi:book-open-variant" label="Przedmiot" value={przedmiot?.name} />
          <Wiersz icon="mdi:account-group-outline" label="Grupa" value={s.group} />
          <Wiersz icon="mdi:account-tie-outline" label="Egzaminator" value={s.examiner} />
        </>
      );
    case 'fee_due':
      return (
        <>
          <Wiersz icon="mdi:cash" label="Do zapłaty" value={kwota(s.outstanding, s.currency)} />
          <Wiersz icon="mdi:cash-multiple" label="Kwota należności" value={kwota(s.total, s.currency)} />
          <Wiersz
            icon="mdi:information-outline"
            label="Stan"
            value={{ paid: 'zapłacone', due: 'do zapłaty', overdue: 'po terminie' }[String(s.state)] ?? s.state}
          />
        </>
      );
    case 'termin_zadania':
      return (
        <>
          <Wiersz icon="mdi:clipboard-text-outline" label="Zadanie" value={s.zadanie} />
          <Wiersz icon="mdi:sitemap-outline" label="Sprawa" value={s.proces} />
          {Boolean(s.po_terminie) && <Wiersz icon="mdi:alert-outline" label="Uwaga" value="po terminie" />}
        </>
      );
    default:
      return null;
  }
};

export const ZdarzenieModal: React.FC<ZdarzenieModalProps> = ({ zdarzenie, nazwaZrodla, onClose }) => {
  if (!zdarzenie) return null;
  const { ref, miejsce, opis, typ } = zdarzenie.extendedProps;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={zdarzenie.title}
      subtitle={nazwaZrodla}
      maxWidth="md"
      footer={
        ref ? (
          <Link
            href={ref}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg bg-marka-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-marka-800"
          >
            {etykietaOdsylacza(ref)}
            <Icon icon="mdi:arrow-right" fontSize={14} />
          </Link>
        ) : undefined
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: kolorZdarzenia(zdarzenie) }} />
          {opisTerminu(zdarzenie)}
        </div>
        <Wiersz icon="mdi:map-marker-outline" label="Miejsce" value={miejsce} />
        <Szczegoly zdarzenie={zdarzenie} />
        {typ !== 'termin_zadania' && <Wiersz icon="mdi:text" label="Opis" value={opis} />}
      </div>
    </Modal>
  );
};

export default ZdarzenieModal;
