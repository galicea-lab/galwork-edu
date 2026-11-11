// Zamówienie legitymacji (Issue) albo przedłużenie (Renewal).
import React, { useState } from 'react';

import { Modal } from '@/components/common';

interface OrderCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rodzaj: 'Issue' | 'Renewal', waznaOd?: string, waznaDo?: string) => void;
  loading: boolean;
  czyPrzedluzenie?: boolean;
}

export const OrderCardModal: React.FC<OrderCardModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  czyPrzedluzenie = false,
}) => {
  const [rodzaj, setRodzaj] = useState<'Issue' | 'Renewal'>(czyPrzedluzenie ? 'Renewal' : 'Issue');
  const [waznaOd, setWaznaOd] = useState('');
  const [waznaDo, setWaznaDo] = useState('');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={czyPrzedluzenie ? 'Przedłużenie legitymacji' : 'Zamówienie legitymacji'}
      subtitle='Dane osobowe i zdjęcie pobiera dziekanat z Twojego konta studenta'
      maxWidth='md'
      footer={
        <div className="flex items-center justify-end gap-2">
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
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            onClick={() => onConfirm(rodzaj, waznaOd || undefined, waznaDo || undefined)}
          >
            {loading ? 'Zamawianie...' : 'Zamów'}
          </button>
        </div>
      }
    >
      <div className="space-y-3 text-xs text-slate-600">
        <label className="block">
          <span className="mb-1 block font-medium text-slate-700">Rodzaj</span>
          <select
            value={rodzaj}
            onChange={(event) => setRodzaj(event.target.value as 'Issue' | 'Renewal')}
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
          >
            <option value="Issue">Wydanie pierwszej legitymacji</option>
            <option value="Renewal">Przedłużenie istniejącej</option>
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block font-medium text-slate-700">Ważna od (opcjonalnie)</span>
            <input
              type="date"
              value={waznaOd}
              onChange={(event) => setWaznaOd(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-medium text-slate-700">Ważna do (opcjonalnie)</span>
            <input
              type="date"
              value={waznaDo}
              onChange={(event) => setWaznaDo(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
            />
          </label>
        </div>

        <p className="rounded-lg bg-slate-50 p-2 text-[11px] text-slate-500">
          Legitymacja wymaga PESEL i zdjęcia w Twoim profilu. Jeśli ich brakuje, uzupełnij dane
          w dziekanacie przed złożeniem zamówienia.
        </p>
      </div>
    </Modal>
  );
};

export default OrderCardModal;
