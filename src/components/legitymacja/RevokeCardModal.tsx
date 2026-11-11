// Wniosek o unieważnienie legitymacji (np. zgubienie).
import React, { useState } from 'react';

import { Modal } from '@/components/common';

interface RevokeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (powod?: string) => void;
  loading: boolean;
}

export const RevokeCardModal: React.FC<RevokeCardModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
}) => {
  const [powod, setPowod] = useState('');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unieważnienie legitymacji"
      subtitle="Po unieważnieniu legitymacja w mObywatel przestanie działać"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-rose-700">
            Operacja jest nieodwracalna - nową legitymację trzeba zamówić ponownie.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              onClick={onClose}
            >
              Anuluj
            </button>
            <button
              type="button"
              disabled={loading}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              onClick={() => onConfirm(powod || undefined)}
            >
              {loading ? 'Zgłaszanie...' : 'Zgłoś unieważnienie'}
            </button>
          </div>
        </div>
      }
    >
      <label className="block text-xs">
        <span className="mb-1 block font-medium text-slate-700">Powód (opcjonalnie)</span>
        <textarea
          value={powod}
          onChange={(event) => setPowod(event.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
          placeholder="np. zgubienie, kradzież, wymiana telefonu"
        />
      </label>
    </Modal>
  );
};

export default RevokeCardModal;
