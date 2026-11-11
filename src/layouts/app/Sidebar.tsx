// pasek boczny - marka, menu dopasowane do roli, stopka.
// Szerokość i kolory pochodzą z layouts/app/theme.ts, pozycje menu z
// layouts/app/navigation.ts, więc wygląd zmienia się bez ruszania logiki.
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';

import { KLASY, MARKA } from '@/layouts/app/theme';
import { GrupaMenu, czyAktywnaPozycja } from '@/layouts/app/navigation';

interface SidebarProps {
  grupy: GrupaMenu[];
  /** Pasek zwinięty do samych ikon (tylko na szerokich ekranach). */
  zwiniety: boolean;
  naPrzelaczenie: () => void;
  /** Trwa ustalanie roli - zamiast menu pokazujemy zarys pozycji. */
  ladowanie: boolean;
  mobilnyOtwarty: boolean;
  zamknijMobilny: () => void;
}

const SzkieletMenu: React.FC<{ zwiniety: boolean }> = ({ zwiniety }) => (
  <div className="space-y-1.5 px-3" aria-hidden="true">
    {[0, 1, 2, 3, 4].map((pozycja) => (
      <div
        key={pozycja}
        className={`h-8 animate-pulse rounded-lg bg-white/[0.06] ${zwiniety ? 'mx-auto w-8' : ''}`}
      />
    ))}
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({
  grupy,
  zwiniety,
  naPrzelaczenie,
  ladowanie,
  mobilnyOtwarty,
  zamknijMobilny,
}) => {
  const { pathname } = useRouter();
  // na telefonie pasek jest zawsze pełny - zwijanie dotyczy tylko desktopu
  const pokazEtykiety = !zwiniety || mobilnyOtwarty;

  return (
    <>
      {mobilnyOtwarty && (
        <button
          type="button"
          aria-label="Zamknij menu"
          onClick={zamknijMobilny}
          className="fixed inset-0 z-40 bg-marka-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`${KLASY.pasekBoczny} ${
          mobilnyOtwarty ? 'fixed inset-y-0 left-0 z-50 flex w-[17rem]' : 'hidden'
        } shrink-0 flex-col text-white transition-[width] duration-300 lg:static lg:z-auto lg:flex ${
          zwiniety ? 'lg:w-20' : 'lg:w-[17rem]'
        }`}
      >
        {/* Marka */}
        <div
          className={`flex h-16 items-center gap-2.5 border-b border-white/10 px-3.5 ${
            pokazEtykiety ? '' : 'justify-center'
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${KLASY.logo}`}
          >
            <Icon icon={MARKA.logo} fontSize={22} />
          </span>
          {pokazEtykiety && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold tracking-tight text-white">
                  {MARKA.nazwa}
                </span>
                <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-akcent-300/80">
                  {MARKA.podtytul}
                </span>
              </span>
              {/* zwijanie tylko na desktopie - na telefonie pasek jest szufladą */}
              <button
                type="button"
                onClick={naPrzelaczenie}
                title="Zwiń menu"
                aria-label="Zwiń menu"
                className="hidden shrink-0 rounded-lg p-1.5 text-marka-200/70 transition hover:bg-white/10 hover:text-white lg:block"
              >
                <Icon icon="mdi:chevron-left" fontSize={18} />
              </button>
              <button
                type="button"
                onClick={zamknijMobilny}
                aria-label="Zamknij menu"
                className="shrink-0 rounded-lg p-1.5 text-marka-200/70 transition hover:bg-white/10 hover:text-white lg:hidden"
              >
                <Icon icon="mdi:close" fontSize={18} />
              </button>
            </>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4">
          {ladowanie && <SzkieletMenu zwiniety={!pokazEtykiety} />}

          {!ladowanie &&
            grupy.map((grupa) => (
              <div key={grupa.tytul} className="mb-5 last:mb-0">
                {pokazEtykiety ? (
                  <p className={`mb-1.5 px-2.5 ${KLASY.grupaMenu}`}>{grupa.tytul}</p>
                ) : (
                  <div className="mx-auto mb-2 h-px w-6 bg-white/10" />
                )}
                <ul className="space-y-0.5">
                  {grupa.pozycje.map((pozycja) => {
                    const aktywna = czyAktywnaPozycja(pathname, pozycja.path);
                    return (
                      <li key={pozycja.path}>
                        <Link
                          href={pozycja.path}
                          title={pozycja.tytul}
                          aria-current={aktywna ? 'page' : undefined}
                          onClick={zamknijMobilny}
                          className={`relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition ${
                            aktywna ? KLASY.pozycjaAktywna : KLASY.pozycja
                          } ${pokazEtykiety ? '' : 'justify-center'}`}
                        >
                          {aktywna && (
                            <span
                              className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full ${KLASY.wskaznik}`}
                            />
                          )}
                          <Icon
                            icon={pozycja.ikona}
                            fontSize={19}
                            className={`shrink-0 ${aktywna ? 'text-akcent-300' : ''}`}
                          />
                          {pokazEtykiety && <span className="truncate">{pozycja.tytul}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
        </nav>

        {/* Stopka */}
        <div className="border-t border-white/10 px-3.5 py-3">
          {pokazEtykiety ? (
            <p className="text-[10px] leading-snug text-marka-300/70">
              <span className="block truncate font-medium text-marka-200/90">{MARKA.uczelnia}</span>
              {MARKA.wersja}
            </p>
          ) : (
            <>
              {/* rozwinięcie zwiniętego paska - przycisk w stopce */}
              <button
                type="button"
                onClick={naPrzelaczenie}
                title="Rozwiń menu"
                aria-label="Rozwiń menu"
                className="mx-auto mb-2 hidden rounded-lg p-1.5 text-marka-200/70 transition hover:bg-white/10 hover:text-white lg:block"
              >
                <Icon icon="mdi:chevron-right" fontSize={18} />
              </button>
              <p className="text-center text-[10px] text-marka-300/70">{MARKA.wersja}</p>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
