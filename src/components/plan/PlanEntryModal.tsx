// Szczegóły wpisu planu - dane zajęć i eksport pojedynczego
// wpisu do kalendarza (.ics).
import React from 'react';
import { Icon } from '@iconify/react';

import { Modal, Badge } from '@/components/common';
import type { WpisPlanu } from '@/types/plan';
import { etykietaTypu, formatDzien, przytnijCzas } from '@/utils/plan';
import { pobierzIcs } from '@/utils/ics';

interface PlanEntryModalProps {
  wpis: WpisPlanu | null;
  onClose: () => void;
}

const Wiersz: React.FC<{ icon: string; label: string; value?: string | null }> = ({
  icon,
  label,
  value,
}) =>
  value ? (
    <div className="flex items-start gap-2 text-sm">
      <Icon icon={icon} fontSize={16} className="mt-0.5 text-slate-400" />
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-slate-800">{value}</p>
      </div>
    </div>
  ) : null;

export const PlanEntryModal: React.FC<PlanEntryModalProps> = ({ wpis, onClose }) => {
  if (!wpis) return null;

  const typ = etykietaTypu(wpis.przedmiot?.type);

  return (
    <Modal
      isOpen={Boolean(wpis)}
      onClose={onClose}
      title={wpis.przedmiot?.name || wpis.przedmiot?.code || 'Zajęcia'}
      subtitle={`${formatDzien(wpis.data)} · ${przytnijCzas(wpis.od)}–${przytnijCzas(wpis.do)}`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => pobierzIcs([wpis], wpis.przedmiot?.name || 'Zajęcia', `zajecia-${wpis.id}`)}
          >
            <Icon icon="mdi:calendar-arrow-right" fontSize={16} />
            Dodaj do kalendarza
          </button>
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
            onClick={onClose}
          >
            Zamknij
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {typ && <Badge variant="info">{typ}</Badge>}
          {wpis.tytul && <Badge variant="purple">{wpis.tytul}</Badge>}
          <Badge variant="default">{wpis.przedmiot?.code}</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Wiersz icon="mdi:calendar-clock" label="Termin" value={`${formatDzien(wpis.data)}, ${przytnijCzas(wpis.od)}–${przytnijCzas(wpis.do)}`} />
          <Wiersz icon="mdi:door" label="Sala" value={wpis.sala} />
          <Wiersz icon="mdi:account-group-outline" label="Grupa" value={wpis.grupa} />
          <Wiersz icon="mdi:human-male-board" label="Prowadzący" value={wpis.wykladowca} />
          <Wiersz icon="mdi:school-outline" label="Kierunek" value={wpis.kierunek} />
        </div>
      </div>
    </Modal>
  );
};

export default PlanEntryModal;
