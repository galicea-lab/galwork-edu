// jednorazowy odczyt kodu QR i kodu aktywacyjnego. Kod jest
// ukrywany po 60 s (licznik), a modal nie zapisuje go nigdzie - po zamknięciu
// trzeba pobrać kody ponownie.
import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import { Modal } from '@/components/common';
import type { KodyLegitymacji } from '@/types/legitymacja';

interface ShowCodesModalProps {
  kody: KodyLegitymacji | null;
  onClose: () => void;
}

const CZAS_WIDOCZNOSCI = 60;

function czyObraz(qr: string): boolean {
  return /^(iVBOR|\/9j\/|R0lGOD)/.test(qr || '');
}

export const ShowCodesModal: React.FC<ShowCodesModalProps> = ({ kody, onClose }) => {
  const [pozostalo, setPozostalo] = useState(CZAS_WIDOCZNOSCI);
  const [skopiowano, setSkopiowano] = useState<string | null>(null);

  useEffect(() => {
    if (!kody) return;
    const timer = window.setInterval(() => {
      setPozostalo((wartosc) => {
        if (wartosc <= 1) {
          window.clearInterval(timer);
          onClose();
          return 0;
        }
        return wartosc - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [kody, onClose]);

  if (!kody) return null;

  const kopiuj = async (wartosc: string, etykieta: string) => {
    try {
      await navigator.clipboard.writeText(wartosc);
      setSkopiowano(etykieta);
      window.setTimeout(() => setSkopiowano(null), 2000);
    } catch {
      setSkopiowano('Błąd schowka');
    }
  };

  return (
    <Modal
      isOpen={Boolean(kody)}
      onClose={onClose}
      title="Kod QR i kod aktywacyjny"
      subtitle={`Dane widoczne jeszcze przez ${pozostalo} s`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500">
            {kody.ostrzezenie || 'Kod aktywacyjny jest jednorazowy - nie udostępniaj go.'}
          </span>
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
      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
          {czyObraz(kody.qr) ? (
            <img
              src={`data:image/png;base64,${kody.qr}`}
              alt="Kod QR legitymacji"
              className="mx-auto h-48 w-48 object-contain"
            />
          ) : (
            <p className="break-all rounded-lg bg-slate-50 p-2 font-mono text-[11px] text-slate-700">
              {kody.qr}
            </p>
          )}
          <p className="mt-2 text-[11px] text-slate-500">
            Zeskanuj kod w aplikacji mObywatel i podaj kod aktywacyjny.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Kod aktywacyjny</p>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 break-all rounded-lg bg-slate-50 px-2 py-1.5 font-mono text-sm text-slate-900">
              {kody.kod_aktywacyjny}
            </code>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => kopiuj(kody.kod_aktywacyjny, 'kod')}
            >
              <Icon icon="mdi:content-copy" fontSize={14} />
              {skopiowano === 'kod' ? 'skopiowano' : 'kopiuj'}
            </button>
          </div>
          {kody.wazny_do && (
            <p className="mt-1 text-[11px] text-slate-500">ważny do: {kody.wazny_do}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
          <Icon icon="mdi:alert-outline" fontSize={14} />
          Nie rób zrzutów ekranu ani nie wysyłaj kodu innej osobie - to dane jednorazowe.
        </div>
      </div>
    </Modal>
  );
};

export default ShowCodesModal;
