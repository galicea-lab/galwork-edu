// 2026-11-10: górny pasek - tytuł strony, rola użytkownika z przełącznikiem,
// wybór studenta (dla dziekanatu/administratora), powiadomienia i konto.
// Rola steruje tym, co widać: przełącznik pojawia się tylko przy kilku rolach,
// a wybór studenta - tylko w rolach administracyjnych.
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { buildLoginHref, useAuth } from '@galicea-lab/nextjs-keycloak-auth';

import { useAppDispatch, useAppSelector } from '@/store';
import { fetchNotifications, markNotificationsRead } from '@/store/notifications';
import { ustawRole } from '@/store/sesja';
import {
  useAktywnaRola,
  useDostepneRole,
  useStudentSesji,
  useWykladowcaSesji,
} from '@/hooks/useSesja';
import { czyRolaAdministracyjna } from '@/utils/sesja';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { RoleSwitcher } from '@/layouts/app/RoleSwitcher';
import { StudentPicker } from '@/layouts/app/StudentPicker';
import { KLASY } from '@/layouts/app/theme';

interface TopbarProps {
  tytul: string;
  grupa: string;
  naMenuMobilny: () => void;
}

/** Inicjały do awatara (maks. 2 znaki). */
function inicjaly(wartosc: string): string {
  const czesci = wartosc.trim().split(/\s+/).filter(Boolean);
  if (czesci.length === 0) return '?';
  if (czesci.length === 1) return czesci[0].slice(0, 2).toUpperCase();
  return `${czesci[0][0]}${czesci[1][0]}`.toUpperCase();
}

export const Topbar: React.FC<TopbarProps> = ({ tytul, grupa, naMenuMobilny }) => {
  const dispatch = useAppDispatch();
  const auth = useAuth();
  const router = useRouter();

  const { items: notifications, unreadCount } = useAppSelector((state) => state.notifications);
  const { status: statusSesji, ostrzezenie } = useAppSelector((state) => state.sesja);
  const rola = useAktywnaRola();
  const dostepneRole = useDostepneRole();
  const student = useStudentSesji();
  const wykladowca = useWykladowcaSesji();

  const nazwaUzytkownika = auth.user?.username || auth.user?.email || '';

  return (
    <header
      className={`flex min-h-16 flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8 ${KLASY.naglowek}`}
    >
      <button
        type="button"
        onClick={naMenuMobilny}
        aria-label="Otwórz menu"
        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
      >
        <Icon icon="mdi:menu" fontSize={18} />
      </button>

      {/* Ścieżka: grupa menu + tytuł. Właściwy nagłówek (większy) ma sama
          strona - tutaj jest kontekst, żeby nie dublować hierarchii. */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-akcent-600">
          {grupa}
        </p>
        {/* nie <h1> - nagłówek strony ma sama strona (jedno h1 na dokument) */}
        <p className="truncate text-sm font-semibold tracking-tight text-marka-900 sm:text-[15px]">
          {tytul}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Rola: plakietka + przełącznik (gdy użytkownik ma kilka ról). */}
        {rola && (
          <RoleSwitcher
            role={dostepneRole}
            aktywna={rola}
            student={student}
            wykladowca={wykladowca}
            onZmiana={(nowa) => dispatch(ustawRole(nowa))}
          />
        )}
        {!rola && statusSesji !== 'ready' && (
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-500">
            <Icon icon="mdi:loading" className="animate-spin" fontSize={14} />
            Ustalam rolę...
          </span>
        )}

        {/* Kontekst studenta dla dziekanatu i administratora. */}
        {czyRolaAdministracyjna(rola) && <StudentPicker />}

        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={(ids) => dispatch(markNotificationsRead({ ids }))}
          onRefresh={() => dispatch(fetchNotifications({ limit: 20 }))}
        />

        <div className="hidden h-6 w-px bg-slate-200 sm:block" />

        {auth.user ? (
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-marka-700 to-marka-900 text-[11px] font-bold text-white">
              {inicjaly(nazwaUzytkownika)}
            </span>
            <span className="hidden text-right leading-tight md:block">
              <span className="block max-w-[12rem] truncate text-[11px] font-semibold text-slate-800">
                {nazwaUzytkownika}
              </span>
              <span className="block max-w-[12rem] truncate text-[10px] text-slate-400">
                {auth.user.email}
              </span>
            </span>
            <button
              type="button"
              onClick={() => auth.logout()}
              title="Wyloguj"
              aria-label="Wyloguj"
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <Icon icon="mdi:logout" fontSize={17} />
            </button>
          </div>
        ) : (
          <Link
            // powrót po zalogowaniu na bieżącą stronę, nie na "/"
            href={buildLoginHref(router.asPath)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-marka-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-marka-800"
          >
            <Icon icon="mdi:login" fontSize={16} />
            Zaloguj
          </Link>
        )}
      </div>

      {/* Ostrzeżenie: hub nie potwierdził roli - działamy na rolach z tokenu. */}
      {ostrzezenie && (
        <p className="flex w-full items-center gap-1.5 text-[11px] text-amber-700">
          <Icon icon="mdi:alert-outline" fontSize={14} className="shrink-0" />
          <span className="truncate">
            Nie udało się potwierdzić roli w Education: {ostrzezenie}
          </span>
        </p>
      )}
    </header>
  );
};
