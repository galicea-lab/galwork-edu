// 2026-11-10: kalendarz użytkownika - zajęcia, terminy akademickie
// (semestr, sesja, egzaminy, płatności, dni wolne), terminy zadań w obiegach
// i kalendarz uczelni. Dane: GET /v1/kalendarz/ (moduł kalendarz/ huba),
// pobierane dla widocznego zakresu siatki. Zastępuje strony /events i /calendar.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Icon } from '@iconify/react';
import { useAuth } from '@galicea-lab/nextjs-keycloak-auth';

import { kalendarzApi } from '@/api/kalendarz';
import { extractApiError } from '@/api/client';
import { EmptyState, LoadingSpinner } from '@/components/common';
import { ZdarzenieModal } from '@/components/kalendarz/ZdarzenieModal';
import { ZrodlaFiltr } from '@/components/kalendarz/ZrodlaFiltr';
import { SubskrypcjaModal } from '@/components/kalendarz/SubskrypcjaModal';
import { useAktywnaRola, useStatusSesji, useWybranyStudent } from '@/hooks/useSesja';
import type { KalendarzParams, KalendarzResponse, Zdarzenie, ZrodloId, ZrodloInfo } from '@/types/kalendarz';
import { dataIso, osobaZapytania } from '@/utils/kalendarz';
import { czyRolaAdministracyjna } from '@/utils/sesja';

const KalendarzWidok = dynamic(() => import('@/components/kalendarz/KalendarzWidok'), {
  ssr: false,
  loading: () => <LoadingSpinner message="Ładowanie kalendarza..." />,
});

const KLUCZ_UKRYTYCH = 'galwork.kalendarz.ukryte';

function wczytajUkryte(): Set<ZrodloId> {
  try {
    const zapisane = window.localStorage.getItem(KLUCZ_UKRYTYCH);
    return new Set(zapisane ? (JSON.parse(zapisane) as ZrodloId[]) : []);
  } catch {
    return new Set();
  }
}

function zapiszUkryte(ukryte: Set<ZrodloId>) {
  try {
    window.localStorage.setItem(KLUCZ_UKRYTYCH, JSON.stringify(Array.from(ukryte)));
  } catch {
    // tryb prywatny / zablokowane dane witryny - filtr działa do przeładowania
  }
}

interface Zakres {
  od: string;
  do: string;
}

/** Wynik ostatniego zakończonego zapytania (klucz = parametry zapytania). */
interface Stan {
  klucz: string | null;
  wynik: KalendarzResponse | null;
  error: string | null;
}

export default function KalendarzPage() {
  const auth = useAuth();
  const zalogowany = Boolean(auth?.user?.username);
  const rola = useAktywnaRola();
  const wybranyStudent = useWybranyStudent();
  const statusSesji = useStatusSesji();

  const [zrodla, setZrodla] = useState<ZrodloInfo[]>([]);
  const [zakres, setZakres] = useState<Zakres | null>(null);
  const [stan, setStan] = useState<Stan>({ klucz: null, wynik: null, error: null });
  // siatka i filtr renderują się tylko w przeglądarce, więc odczyt
  // localStorage w inicjalizatorze nie psuje hydratacji
  const [ukryte, setUkryte] = useState<Set<ZrodloId>>(() =>
    typeof window === 'undefined' ? new Set() : wczytajUkryte()
  );
  const [wybrane, setWybrane] = useState<Zdarzenie | null>(null);
  const [odswiez, setOdswiez] = useState(0);
  const [subskrypcja, setSubskrypcja] = useState(false);

  useEffect(() => {
    if (!zalogowany) return;
    kalendarzApi
      .getZrodla()
      .then(setZrodla)
      .catch(() => setZrodla([]));
  }, [zalogowany]);

  const onZakres = useCallback((start: Date, koniecWylacznie: Date) => {
    const koniec = new Date(koniecWylacznie);
    koniec.setDate(koniec.getDate() - 1);
    const nowy = { od: dataIso(start), do: dataIso(koniec) };
    setZakres((stary) => (stary?.od === nowy.od && stary?.do === nowy.do ? stary : nowy));
  }, []);

  // parametry zapytania: widoczny zakres, rola i wybrany student
  const parametry = useMemo<KalendarzParams | null>(
    () =>
      zalogowany && zakres && statusSesji !== 'loading'
        ? { ...zakres, ...osobaZapytania(rola, wybranyStudent) }
        : null,
    [zalogowany, zakres, statusSesji, rola, wybranyStudent]
  );
  const klucz = parametry ? `${JSON.stringify(parametry)}#${odswiez}` : null;

  // spóźnione odpowiedzi (szybkie przełączanie miesięcy) są pomijane
  useEffect(() => {
    if (!parametry || !klucz) return;
    let aktualne = true;
    kalendarzApi
      .getKalendarz(parametry)
      .then((odpowiedz) => {
        if (odpowiedz.code !== 0) throw new Error(odpowiedz.message || 'Nie udało się pobrać kalendarza');
        if (aktualne) setStan({ klucz, wynik: odpowiedz, error: null });
      })
      .catch((e) => {
        if (aktualne) setStan((stary) => ({ klucz, wynik: stary.wynik, error: extractApiError(e) }));
      });
    return () => {
      aktualne = false;
    };
  }, [parametry, klucz]);

  const { wynik, error } = stan;
  const loading = klucz !== null && stan.klucz !== klucz;

  const przelacz = useCallback((id: ZrodloId) => {
    setUkryte((stare) => {
      const nowe = new Set(stare);
      if (nowe.has(id)) nowe.delete(id);
      else nowe.add(id);
      zapiszUkryte(nowe);
      return nowe;
    });
  }, []);

  const widoczne = useMemo(
    () => (wynik?.events ?? []).filter((z) => !ukryte.has(z.extendedProps.zrodlo)),
    [wynik, ukryte]
  );
  const bledy = (wynik?.zrodla ?? []).filter((z) => z.dotyczy && !z.ok);
  const nazwaZrodla = (id?: ZrodloId) => zrodla.find((z) => z.id === id)?.nazwa;
  const bezStudenta = czyRolaAdministracyjna(rola) && !wybranyStudent?.nr;

  if (!zalogowany) {
    return (
      <EmptyState
        icon="mdi:calendar-lock-outline"
        title="Zaloguj się, aby zobaczyć kalendarz"
        description="Kalendarz pokazuje Twoje zajęcia, sesję, egzaminy, terminy płatności i terminy spraw."
      />
    );
  }

  return (
    <>
      <Head>
        <title>Kalendarz | Galwork Edu</title>
      </Head>

      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kalendarz</h1>
            <p className="mt-1 text-xs text-slate-500">
              Zajęcia, semestr i sesja, egzaminy, terminy płatności, terminy zadań i wydarzenia uczelni.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {loading && (
              <span className="inline-flex items-center gap-1">
                <Icon icon="mdi:loading" className="animate-spin" fontSize={14} />
                odświeżanie...
              </span>
            )}
            <button
              type="button"
              onClick={() => setOdswiez((n) => n + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 font-medium text-slate-700 hover:bg-slate-50"
            >
              <Icon icon="mdi:refresh" fontSize={14} />
              Odśwież
            </button>
            {/* 2026-11-10: subskrypcja ICS (A5) */}
            <button
              type="button"
              onClick={() => setSubskrypcja(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-marka-700 px-2 py-1 font-medium text-white hover:bg-marka-800"
            >
              <Icon icon="mdi:calendar-sync-outline" fontSize={14} />
              Dodaj do Google / Outlook
            </button>
          </div>
        </div>

        {zrodla.length > 0 && (
          <ZrodlaFiltr zrodla={zrodla} statusy={wynik?.zrodla ?? []} ukryte={ukryte} onPrzelacz={przelacz} />
        )}

        {bezStudenta && (
          <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
            <Icon icon="mdi:information-outline" fontSize={16} className="mt-0.5" />
            <p>Wybierz studenta w nagłówku, żeby zobaczyć jego zajęcia, egzaminy i terminy płatności.</p>
          </div>
        )}

        {(error || wynik?.ostrzezenie || bledy.length > 0) && (
          <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {error && <p>{error}</p>}
            {wynik?.ostrzezenie && <p>{wynik.ostrzezenie}</p>}
            {bledy.map((z) => (
              <p key={z.id}>
                <strong>{z.nazwa}:</strong> {z.komunikat || 'źródło niedostępne'} - pozostałe terminy są widoczne.
              </p>
            ))}
          </div>
        )}

        <KalendarzWidok zdarzenia={widoczne} onZakres={onZakres} onWybierz={setWybrane} />
      </div>

      <SubskrypcjaModal isOpen={subskrypcja} rola={rola} onClose={() => setSubskrypcja(false)} />

      <ZdarzenieModal
        zdarzenie={wybrane}
        nazwaZrodla={nazwaZrodla(wybrane?.extendedProps.zrodlo)}
        onClose={() => setWybrane(null)}
      />
    </>
  );
}
