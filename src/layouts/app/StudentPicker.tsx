// wybór studenta dla roli dziekanatu i administratora - ekrany
// studenckie (plan, oceny, frekwencja, opłaty, legitymacja, studia) pokazują
// wtedy dane wskazanej osoby. Lista pochodzi z /v1/edu/studenci (tylko dla
// dziekanatu), więc pobieramy ją raz, przy pierwszym otwarciu, i filtrujemy
// lokalnie; wpisanie numeru albumu działa też bez listy.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

import { studenciApi } from '@/api/studenci';
import type { StudentListy } from '@/api/studenci';
import { useAppDispatch } from '@/store';
import { ustawStudenta } from '@/store/sesja';
import { useWybranyStudent } from '@/hooks/useSesja';
import { extractApiError } from '@/api/client';

/** Ile pozycji pokazujemy na raz - lista aktywnych studentów bywa długa. */
const LIMIT_WYNIKOW = 25;

export const StudentPicker: React.FC = () => {
  const dispatch = useAppDispatch();
  const wybrany = useWybranyStudent();

  const [otwarty, setOtwarty] = useState(false);
  const [studenci, setStudenci] = useState<StudentListy[] | null>(null);
  const [ladowanie, setLadowanie] = useState(false);
  const [blad, setBlad] = useState('');
  const [fraza, setFraza] = useState('');
  const kontener = useRef<HTMLDivElement>(null);

  // Lista pobierana leniwie - dopiero gdy użytkownik otworzy wyszukiwarkę.
  // Pobranie startuje z obsługi zdarzenia (nie z efektu), żeby nie wywoływać
  // aktualizacji stanu w ciele efektu.
  const pobierzListe = async () => {
    if (studenci || ladowanie) return;
    setLadowanie(true);
    setBlad('');
    try {
      const response = await studenciApi.list();
      if (response.code !== 0) {
        setBlad(response.message || 'Nie udało się pobrać listy studentów');
        setStudenci([]);
        return;
      }
      setStudenci(response.studenci ?? []);
    } catch (error) {
      setBlad(extractApiError(error));
      setStudenci([]);
    } finally {
      setLadowanie(false);
    }
  };

  useEffect(() => {
    if (!otwarty) return;
    const zamknij = (event: MouseEvent) => {
      if (kontener.current && !kontener.current.contains(event.target as Node)) {
        setOtwarty(false);
      }
    };
    const naKlawisz = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOtwarty(false);
    };
    document.addEventListener('mousedown', zamknij);
    document.addEventListener('keydown', naKlawisz);
    return () => {
      document.removeEventListener('mousedown', zamknij);
      document.removeEventListener('keydown', naKlawisz);
    };
  }, [otwarty]);

  const wyniki = useMemo(() => {
    const szukana = fraza.trim().toLowerCase();
    if (!studenci?.length) return [];
    const pasujace = szukana
      ? studenci.filter((student) =>
          `${student.nazwisko} ${student.imie_i} ${student.nr} ${student.email}`
            .toLowerCase()
            .includes(szukana)
        )
      : studenci;
    return pasujace.slice(0, LIMIT_WYNIKOW);
  }, [studenci, fraza]);

  const wybierz = (student: StudentListy) => {
    dispatch(
      ustawStudenta({
        nr: student.nr,
        nazwisko: student.nazwisko,
        imie: student.imie_i,
        semestr: student.nr_semestru,
      })
    );
    setOtwarty(false);
    setFraza('');
  };

  /** Wpisany numer albumu działa nawet bez listy (np. gdy lista się nie pobrała). */
  const wybierzRecznie = () => {
    const album = fraza.trim();
    if (!album) return;
    dispatch(ustawStudenta({ nr: album }));
    setOtwarty(false);
    setFraza('');
  };

  const etykieta = wybrany
    ? [wybrany.nazwisko, wybrany.imie].filter(Boolean).join(' ') || `album ${wybrany.nr}`
    : '';

  return (
    <div className="relative" ref={kontener}>
      <button
        type="button"
        onClick={() => {
          setOtwarty((wartosc) => !wartosc);
          void pobierzListe();
        }}
        aria-haspopup="dialog"
        aria-expanded={otwarty}
        title={wybrany ? 'Zmień studenta' : 'Wybierz studenta, którego dane chcesz zobaczyć'}
        className={`inline-flex max-w-[15rem] items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition ${
          wybrany
            ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
        }`}
      >
        <Icon icon="mdi:account-search-outline" fontSize={18} className="shrink-0" />
        <span className="min-w-0 leading-tight">
          <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-70">
            {wybrany ? `Student · ${wybrany.nr}` : 'Wybierz studenta'}
          </span>
          <span className="block truncate text-[11px] font-medium">
            {wybrany ? etykieta : 'wymagane w tej roli'}
          </span>
        </span>
        <Icon
          icon={otwarty ? 'mdi:chevron-up' : 'mdi:chevron-down'}
          fontSize={16}
          className="shrink-0 opacity-60"
        />
      </button>

      {otwarty && (
        <div
          role="dialog"
          aria-label="Wybór studenta"
          className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
        >
          <div className="border-b border-slate-100 p-2">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-2.5 py-1.5">
              <Icon icon="mdi:magnify" fontSize={16} className="shrink-0 text-slate-400" />
              <input
                autoFocus
                value={fraza}
                onChange={(event) => setFraza(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    if (wyniki.length > 0) wybierz(wyniki[0]);
                    else wybierzRecznie();
                  }
                }}
                placeholder="Nazwisko, numer albumu lub e-mail"
                className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5">
            {ladowanie && (
              <p className="flex items-center gap-2 px-3 py-3 text-[11px] text-slate-500">
                <Icon icon="mdi:loading" className="animate-spin" fontSize={14} />
                Pobieranie listy studentów...
              </p>
            )}

            {!ladowanie && blad && (
              <p className="mx-1.5 mb-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] leading-snug text-amber-800">
                {blad} Wpisz numer albumu i naciśnij Enter.
              </p>
            )}

            {!ladowanie && !blad && studenci?.length === 0 && (
              <p className="px-3 py-3 text-[11px] text-slate-500">Brak aktywnych studentów.</p>
            )}

            {!ladowanie &&
              wyniki.map((student) => (
                <button
                  key={`${student.nr}-${student.email}`}
                  type="button"
                  onClick={() => wybierz(student)}
                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left transition hover:bg-slate-50 ${
                    wybrany?.nr === student.nr ? 'bg-slate-100' : ''
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-marka-100 text-[10px] font-bold text-marka-700">
                    {student.nr.slice(-3)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-slate-800">
                      {student.nazwisko} {student.imie_i}
                    </span>
                    <span className="block truncate text-[10px] text-slate-500">
                      album {student.nr}
                      {student.nr_semestru ? ` · semestr ${student.nr_semestru}` : ''}
                    </span>
                  </span>
                </button>
              ))}

            {!ladowanie && !blad && wyniki.length === 0 && fraza.trim() !== '' && (
              <button
                type="button"
                onClick={wybierzRecznie}
                className="w-full rounded-xl px-3 py-2 text-left text-[11px] text-slate-600 hover:bg-slate-50"
              >
                Użyj numeru albumu <span className="font-semibold">{fraza.trim()}</span>
              </button>
            )}
          </div>

          {wybrany && (
            <div className="border-t border-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => {
                  dispatch(ustawStudenta(null));
                  setOtwarty(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
              >
                <Icon icon="mdi:close-circle-outline" fontSize={14} />
                Wyczyść wybór studenta
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
