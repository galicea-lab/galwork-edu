// 2026-11-10: plakietka roli z możliwością przełączenia. Pokazuje, w jakiej
// roli występuje użytkownik (student / nauczyciel akademicki / administracja /
// administrator / kandydat), a gdy ma więcej niż jedną rolę - pozwala wybrać
// aktywną. Role przychodzą z huba (/v1/edu/ja); możliwość przełączenia zależy
// wyłącznie od tego, jakie role zwrócił backend.
import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

import type { Rola, StudentTozsamosc, WykladowcaTozsamosc } from '@/types/sesja';
import { META_ROLI } from '@/layouts/app/navigation';

interface RoleSwitcherProps {
  role: Rola[];
  aktywna: Rola;
  student?: StudentTozsamosc | null;
  wykladowca?: WykladowcaTozsamosc | null;
  onZmiana: (rola: Rola) => void;
}

/** Dodatkowy szczegół roli: numer albumu studenta albo wydział wykładowcy. */
function szczegolRoli(
  rola: Rola,
  student?: StudentTozsamosc | null,
  wykladowca?: WykladowcaTozsamosc | null
): string {
  if (rola === 'student' && student?.nr_albumu) return `nr albumu ${student.nr_albumu}`;
  if (rola === 'wykladowca' && wykladowca?.wydzial) return wykladowca.wydzial;
  if (rola === 'dziekanat') return 'dziekanat';
  if (rola === 'administrator') return 'pełny dostęp';
  return '';
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  role,
  aktywna,
  student,
  wykladowca,
  onZmiana,
}) => {
  const [otwarty, setOtwarty] = useState(false);
  const kontener = useRef<HTMLDivElement>(null);
  const meta = META_ROLI[aktywna];
  const przelaczalna = role.length > 1;
  const szczegol = szczegolRoli(aktywna, student, wykladowca);

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

  return (
    <div className="relative" ref={kontener}>
      <button
        type="button"
        onClick={() => przelaczalna && setOtwarty((wartosc) => !wartosc)}
        aria-haspopup={przelaczalna ? 'menu' : undefined}
        aria-expanded={przelaczalna ? otwarty : undefined}
        title={
          przelaczalna
            ? 'Występujesz w kilku rolach - kliknij, żeby przełączyć'
            : `Twoja rola: ${meta.nazwa}`
        }
        className={`inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition ${meta.plakietka} ${
          przelaczalna ? 'hover:brightness-95 cursor-pointer' : 'cursor-default'
        }`}
      >
        <Icon icon={meta.ikona} fontSize={18} className="shrink-0" />
        <span className="hidden sm:block leading-tight">
          <span className="block text-[11px] font-semibold">{meta.nazwa}</span>
          {szczegol && <span className="block text-[10px] opacity-70">{szczegol}</span>}
        </span>
        {przelaczalna && (
          <Icon
            icon={otwarty ? 'mdi:chevron-up' : 'mdi:chevron-down'}
            fontSize={16}
            className="shrink-0 opacity-70"
          />
        )}
      </button>

      {otwarty && przelaczalna && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10"
        >
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Występujesz jako
          </p>
          {role.map((pozycja) => {
            const opcja = META_ROLI[pozycja];
            const wybrana = pozycja === aktywna;
            return (
              <button
                key={pozycja}
                type="button"
                role="menuitemradio"
                aria-checked={wybrana}
                onClick={() => {
                  setOtwarty(false);
                  if (!wybrana) onZmiana(pozycja);
                }}
                className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left transition ${
                  wybrana ? 'bg-slate-100' : 'hover:bg-slate-50'
                }`}
              >
                <Icon
                  icon={opcja.ikona}
                  fontSize={20}
                  className={`mt-0.5 shrink-0 ${opcja.akcent}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-slate-800">{opcja.nazwa}</span>
                  <span className="block text-[11px] leading-snug text-slate-500">
                    {opcja.opis}
                  </span>
                  {pozycja === 'student' && student?.nr_albumu && (
                    <span className="mt-0.5 block text-[11px] text-slate-400">
                      nr albumu {student.nr_albumu}
                    </span>
                  )}
                </span>
                {wybrana && (
                  <Icon
                    icon="mdi:check-circle"
                    fontSize={18}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                )}
              </button>
            );
          })}
          <p className="border-t border-slate-100 px-3 py-2 text-[10px] leading-snug text-slate-400">
            Menu i dostępne ekrany zmieniają się wraz z rolą. Uprawnienia sprawdza serwer.
          </p>
        </div>
      )}
    </div>
  );
};
