// ekran legitymacji mLegitymacja - stan zamówienia, zamówienie
// lub przedłużenie, jednorazowy kod QR z licznikiem i wniosek o unieważnienie.
// Dane: /v1/edu/legitymacja* (hub -> education.portal.api.*).
import React, { useState } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';

import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchLegitymacja,
  odswiezLegitymacje,
  uniewaznijLegitymacje,
  wyczyscBlad,
  wyczyscInfo,
  zamowLegitymacje,
} from '@/store/legitymacja';
import { legitymacjaApi } from '@/api/legitymacja';
// kontekst studenta - w rolach administracyjnych trzeba go wskazać.
import { albumZapytania } from '@/utils/sesja';
import { EmptyState, LoadingSpinner } from '@/components/common';
import {
  CardStatusCard,
  OrderCardModal,
  RevokeCardModal,
  ShowCodesModal,
} from '@/components/legitymacja';
import type { KodyLegitymacji } from '@/types/legitymacja';

export default function LegitymacjaPage() {
  const dispatch = useAppDispatch();
  const { legitymacja, loading, saving, error, info } = useAppSelector(
    (state) => state.legitymacja
  );
  const sesja = useAppSelector((state) => state.sesja);

  const [modalZamowienia, setModalZamowienia] = useState(false);
  const [modalUniewaznienia, setModalUniewaznienia] = useState(false);
  const [kody, setKody] = useState<KodyLegitymacji | null>(null);
  const [bladKodow, setBladKodow] = useState<string | null>(null);
  const [pobieranieKodow, setPobieranieKodow] = useState(false);

  const odswiez = () => {
    dispatch(odswiezLegitymacje());
  };

  const zamow = async (rodzaj: 'Issue' | 'Renewal', waznaOd?: string, waznaDo?: string) => {
    await dispatch(zamowLegitymacje({ rodzaj, wazna_od: waznaOd, wazna_do: waznaDo }));
    setModalZamowienia(false);
  };

  const uniewaznij = async (powod?: string) => {
    await dispatch(uniewaznijLegitymacje(powod));
    setModalUniewaznienia(false);
  };

  const pokazKody = async () => {
    setBladKodow(null);
    setPobieranieKodow(true);
    try {
      // dziekanat pobiera kody wskazanego studenta.
      const response = await legitymacjaApi.getCodes(albumZapytania(sesja).album);
      if (response.code !== 0 || !response.kody) {
        setBladKodow(response.message || 'Kody nie są jeszcze dostępne');
        return;
      }
      setKody(response.kody);
    } catch (exception) {
      setBladKodow(exception instanceof Error ? exception.message : 'Nie udało się pobrać kodów');
    } finally {
      setPobieranieKodow(false);
    }
  };

  return (
    <>
      <Head>
        <title>Legitymacja | Galwork Edu</title>
      </Head>

      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Legitymacja</h1>
            <p className="mt-1 text-xs text-slate-500">
              mLegitymacja w aplikacji mObywatel: zamówienie, kod QR i kod aktywacyjny.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={odswiez}
            disabled={saving}
          >
            <Icon icon="mdi:refresh" fontSize={16} className={saving ? 'animate-spin' : ''} />
            Odśwież stan
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
            <Icon icon="mdi:alert-circle-outline" fontSize={16} className="mt-0.5" />
            <p className="flex-1">{error}</p>
            <button
              type="button"
              className="rounded-lg border border-rose-200 bg-white px-2 py-1 font-medium text-rose-700 hover:bg-rose-100"
              onClick={() => {
                dispatch(wyczyscBlad());
                dispatch(fetchLegitymacja());
              }}
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {bladKodow && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <Icon icon="mdi:alert-outline" fontSize={16} className="mt-0.5" />
            <p className="flex-1">{bladKodow}</p>
            <button
              type="button"
              className="rounded-lg border border-amber-200 bg-white px-2 py-1 font-medium text-amber-700 hover:bg-amber-100"
              onClick={() => setBladKodow(null)}
            >
              OK
            </button>
          </div>
        )}

        {info && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            <Icon icon="mdi:check-circle-outline" fontSize={16} />
            <span className="flex-1">{info}</span>
            <button
              type="button"
              className="rounded-lg border border-emerald-200 bg-white px-2 py-1 font-medium text-emerald-700 hover:bg-emerald-100"
              onClick={() => dispatch(wyczyscInfo())}
            >
              OK
            </button>
          </div>
        )}

        {loading && <LoadingSpinner message="Ładowanie stanu legitymacji..." />}

        {!loading && legitymacja && (
          <>
            {legitymacja.stan === 'none' && (
              <EmptyState
                icon="mdi:card-account-details-outline"
                title="Nie masz jeszcze legitymacji"
                description="Zamów mLegitymację - dane i zdjęcie pobierze dziekanat, a kod QR odbierzesz tutaj po przygotowaniu karty."
                action={
                  <button
                    type="button"
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                    onClick={() => setModalZamowienia(true)}
                  >
                    Zamów legitymację
                  </button>
                }
              />
            )}

            {legitymacja.stan !== 'none' && (
              <>
                <CardStatusCard legitymacja={legitymacja} />

                <div className="flex flex-wrap items-center gap-2">
                  {legitymacja.kody_dostepne ? (
                    <button
                      type="button"
                      disabled={pobieranieKodow}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                      onClick={pokazKody}
                    >
                      <Icon icon="mdi:qrcode" fontSize={16} />
                      {pobieranieKodow ? 'Pobieranie...' : 'Pokaż kod QR i kod aktywacyjny'}
                    </button>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      Kod QR pojawi się tutaj, gdy legitymacja będzie gotowa (odśwież stan).
                    </p>
                  )}

                  {legitymacja.stan === 'issued' && (
                    <>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        onClick={() => setModalZamowienia(true)}
                      >
                        <Icon icon="mdi:card-account-details-star-outline" fontSize={16} />
                        Przedłuż legitymację
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                        onClick={() => setModalUniewaznienia(true)}
                      >
                        <Icon icon="mdi:card-remove-outline" fontSize={16} />
                        Zgłoś unieważnienie
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <OrderCardModal
        isOpen={modalZamowienia}
        onClose={() => setModalZamowienia(false)}
        onConfirm={zamow}
        loading={saving}
        czyPrzedluzenie={legitymacja?.stan === 'issued'}
      />

      <RevokeCardModal
        isOpen={modalUniewaznienia}
        onClose={() => setModalUniewaznienia(false)}
        onConfirm={uniewaznij}
        loading={saving}
      />

      {/* key powoduje remount licznika przy każdym nowym odczycie kodów */}
      <ShowCodesModal key={kody?.zamowienie ?? 'brak'} kody={kody} onClose={() => setKody(null)} />
    </>
  );
}
