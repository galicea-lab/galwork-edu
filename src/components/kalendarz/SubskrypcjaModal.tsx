// 2026-11-10: subskrypcja kalendarza w Google Calendar / Outlook - adres
// ICS z osobistym tokenem (hub: /v1/kalendarz/subskrypcja, kanał
// /v1/kalendarz/ics/<token>.ics). Adres jest widoczny tylko zaraz po
// wygenerowaniu (hub przechowuje skrót tokenu); nowy adres unieważnia stary.
import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import { kalendarzApi } from '@/api/kalendarz';
import { extractApiError } from '@/api/client';
import { Modal } from '@/components/common';
import type { SubskrypcjaNowa, SubskrypcjaStatus, Szczegolowosc } from '@/types/kalendarz';
import type { Rola } from '@/types/sesja';

interface SubskrypcjaModalProps {
  isOpen: boolean;
  rola: Rola | null;
  onClose: () => void;
}

const NAZWA = 'Galwork - mój kalendarz';
const DATA = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short' });

function odnosniki(nowa: SubskrypcjaNowa) {
  const url = encodeURIComponent(nowa.url);
  const nazwa = encodeURIComponent(NAZWA);
  return [
    {
      etykieta: 'Google Calendar',
      ikona: 'mdi:google',
      href: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(nowa.webcal_url)}`,
    },
    {
      etykieta: 'Outlook.com',
      ikona: 'mdi:microsoft-outlook',
      href: `https://outlook.live.com/calendar/0/addfromweb?url=${url}&name=${nazwa}`,
    },
    {
      etykieta: 'Microsoft 365',
      ikona: 'mdi:microsoft-office',
      href: `https://outlook.office.com/calendar/0/addfromweb?url=${url}&name=${nazwa}`,
    },
    { etykieta: 'Apple / inne (webcal)', ikona: 'mdi:apple', href: nowa.webcal_url },
  ];
}

function data(text?: string | null): string {
  if (!text) return '-';
  const value = new Date(text);
  return Number.isNaN(value.getTime()) ? text : DATA.format(value);
}

export const SubskrypcjaModal: React.FC<SubskrypcjaModalProps> = ({ isOpen, rola, onClose }) => {
  const [status, setStatus] = useState<SubskrypcjaStatus | null>(null);
  const [nowa, setNowa] = useState<SubskrypcjaNowa | null>(null);
  const [szczegolowosc, setSzczegolowosc] = useState<Szczegolowosc>('minimalna');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skopiowano, setSkopiowano] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let aktualne = true;
    kalendarzApi
      .getSubskrypcja()
      .then((s) => {
        if (!aktualne) return;
        setStatus(s);
        if (s.szczegolowosc) setSzczegolowosc(s.szczegolowosc);
      })
      .catch((e) => aktualne && setError(extractApiError(e)));
    return () => {
      aktualne = false;
    };
  }, [isOpen]);

  const zamknij = () => {
    // adres z tokenem nie zostaje w pamięci strony po zamknięciu okna
    setNowa(null);
    setError(null);
    setSkopiowano(false);
    onClose();
  };

  const generuj = async () => {
    setBusy(true);
    setError(null);
    setSkopiowano(false);
    try {
      const wynik = await kalendarzApi.utworzSubskrypcje(szczegolowosc, rola);
      setNowa(wynik);
      setStatus(wynik);
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setBusy(false);
    }
  };

  const odwolaj = async () => {
    setBusy(true);
    setError(null);
    try {
      setStatus(await kalendarzApi.usunSubskrypcje());
      setNowa(null);
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setBusy(false);
    }
  };

  const kopiuj = async () => {
    if (!nowa) return;
    try {
      await navigator.clipboard.writeText(nowa.url);
      setSkopiowano(true);
    } catch {
      setSkopiowano(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={zamknij}
      title="Kalendarz w telefonie i poczcie"
      subtitle="Subskrypcja w Google Calendar, Outlook lub Apple"
      maxWidth="xl"
    >
      <div className="space-y-4 text-sm text-slate-700">
        <p>
          Dodaj swój kalendarz uczelniany do Google Calendar, Outlooka albo kalendarza w telefonie. Terminy
          aktualizują się same, ale z opóźnieniem - Google i Outlook odświeżają subskrypcje co kilka godzin
          (Google nawet raz na dobę). Aktualny stan zawsze jest tutaj.
        </p>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</div>
        )}

        {status?.aktywna && !nowa && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <p className="font-medium text-slate-800">Masz aktywną subskrypcję</p>
            <p>
              Utworzona: {data(status.utworzono)} · ostatnie pobranie: {data(status.ostatnie_pobranie)} · pobrań:{' '}
              {status.liczba_pobran}
            </p>
            <p className="mt-1">
              Adresu nie da się wyświetlić ponownie. Jeśli go zgubiłeś, wygeneruj nowy - poprzedni przestanie działać.
            </p>
          </div>
        )}

        {!nowa && (
          <fieldset className="space-y-2">
            <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Zakres informacji
            </legend>
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="szczegolowosc"
                className="mt-1"
                checked={szczegolowosc === 'minimalna'}
                onChange={() => setSzczegolowosc('minimalna')}
              />
              <span>
                <span className="font-medium">Podstawowy</span> - nazwy zajęć i egzaminów, sale, terminy. Bez kwot opłat i
                nazw spraw.
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="szczegolowosc"
                className="mt-1"
                checked={szczegolowosc === 'pelna'}
                onChange={() => setSzczegolowosc('pelna')}
              />
              <span>
                <span className="font-medium">Pełny</span> - także kwoty do zapłaty, nazwy spraw, prowadzący i odnośniki do
                portalu.
              </span>
            </label>
          </fieldset>
        )}

        {nowa && (
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Twój adres kalendarza</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={nowa.url}
                  onFocus={(e) => e.target.select()}
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 font-mono text-xs"
                  aria-label="Adres subskrypcji"
                />
                <button
                  type="button"
                  onClick={kopiuj}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium hover:bg-slate-50"
                >
                  <Icon icon={skopiowano ? 'mdi:check' : 'mdi:content-copy'} fontSize={14} />
                  {skopiowano ? 'Skopiowano' : 'Kopiuj'}
                </button>
              </div>
              <p className="mt-1 text-xs text-amber-700">
                Nie udostępniaj tego adresu - każdy, kto go zna, zobaczy Twoje terminy. Adres widzisz tylko teraz.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {odnosniki(nowa).map((o) => (
                <a
                  key={o.etykieta}
                  href={o.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50"
                >
                  <Icon icon={o.ikona} fontSize={16} />
                  Dodaj do: {o.etykieta}
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Ręcznie: Google Calendar - „Inne kalendarze” → „Z adresu URL”; Outlook - „Dodaj kalendarz” → „Subskrybuj
              z internetu”. Google i Outlook muszą mieć dostęp do adresu z internetu.
            </p>
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
          {status?.aktywna ? (
            <button
              type="button"
              disabled={busy}
              onClick={odwolaj}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
            >
              <Icon icon="mdi:link-off" fontSize={14} />
              Wyłącz subskrypcję
            </button>
          ) : (
            <span />
          )}
          {!nowa && (
            <button
              type="button"
              disabled={busy}
              onClick={generuj}
              className="inline-flex items-center gap-1 rounded-lg bg-marka-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-marka-800 disabled:opacity-50"
            >
              <Icon icon={busy ? 'mdi:loading' : 'mdi:link-variant'} className={busy ? 'animate-spin' : ''} fontSize={14} />
              {status?.aktywna ? 'Wygeneruj nowy adres' : 'Utwórz adres kalendarza'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SubskrypcjaModal;
