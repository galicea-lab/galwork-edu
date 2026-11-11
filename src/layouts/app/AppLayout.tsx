// 2026-11-10: powłoka aplikacji - pasek boczny + górny pasek + treść.
// Wydzielona z dotychczasowego layouts/TailwindLayout.tsx, żeby wygląd i menu
// zmieniały się w jednym miejscu (theme.ts, navigation.ts), a tutaj została
// tylko logika: sesja Keycloak, role użytkownika (store/sesja) i powiadomienia.
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@galicea-lab/nextjs-keycloak-auth';

import { useAppDispatch, useAppSelector } from '@/store';
import { fetchNotifications } from '@/store/notifications';
import { fetchSesja, wczytajPreferencje } from '@/store/sesja';
import { setAuthToken } from '@/api/client';
import {
  czyRolaAdministracyjna,
  roleZTokenu,
  wczytajPreferencje as wczytajZapisane,
  zapiszPreferencje,
} from '@/utils/sesja';
import { MENU_GOSCIA, menuDlaRoli, tytulStrony } from '@/layouts/app/navigation';
import { KLASY } from '@/layouts/app/theme';
import { Sidebar } from '@/layouts/app/Sidebar';
import { Topbar } from '@/layouts/app/Topbar';

interface Props {
  children: ReactNode;
}

const AppLayout = ({ children }: Props) => {
  // desktop: pasek boczny rozwinięty/zwinięty; telefon: szuflada
  const [zwiniety, setZwiniety] = useState(false);
  const [mobilnyOtwarty, setMobilnyOtwarty] = useState(false);

  const { pathname } = useRouter();
  const auth = useAuth();
  const dispatch = useAppDispatch();

  const { aktywnaRola, dostepneRole, wybranyStudent, status, uzytkownik } = useAppSelector(
    (state) => state.sesja
  );

  // Synchronizacja tokenu Bearer z Keycloak.
  //
  // 1) `useAuth()` (@galicea-lab/nextjs-keycloak-auth) nie wystawia pola
  // `token` - zwraca `{ user, loading, authToken, ... }`, gdzie `authToken` to
  // cały obiekt tokenów. Bez tego `setAuthToken` z `@/api/client` nigdy nie
  // dostawał JWT, a klienty API wysyłały żądania bez nagłówka `Authorization`
  // (backend odpowiadał 401 na każde wywołanie).
  //
  // 2) Synchronizacja działa w CIELE renderu (nie w `useEffect`), celowo.
  // React odpala efekty "od dołu" - efekty komponentów potomnych wykonują się
  // PRZED efektem tego layoutu w tym samym commicie, więc strona zdążyłaby
  // wysłać pierwsze zapytanie bez tokenu. Rodzic renderuje się przed dzieckiem
  // - wywołanie w ciele renderu gwarantuje aktualny token przed montowaniem
  // dzieci. Ref zamiast gołego wywołania przy każdym renderze - żeby nie pisać
  // do localStorage częściej niż przy faktycznej zmianie tokenu.
  const lastSyncedAccessTokenRef = useRef<string | null>(null);
  const currentAccessToken = auth?.authToken?.access_token ?? null;
  if (lastSyncedAccessTokenRef.current !== currentAccessToken) {
    lastSyncedAccessTokenRef.current = currentAccessToken;
    setAuthToken(currentAccessToken);
  }

  // 3) Dopóki `AuthProvider` nie skończył wczytywać/odświeżać tokenu
  // (`auth.loading`), nie montujemy treści - inaczej strony odpytujące API w
  // pierwszym `useEffect` zdążą to zrobić bez tokenu. Pasek boczny i nagłówek
  // renderują się od razu (krótki komunikat w obszarze treści).
  const authReady = !auth || auth.loading === false;

  // Preferencje (ostatnia rola i wybrany student) wczytujemy dopiero po
  // zamontowaniu - `localStorage` nie istnieje na serwerze, a render musi być
  // identyczny po obu stronach.
  useEffect(() => {
    dispatch(wczytajPreferencje(wczytajZapisane()));
  }, [dispatch]);

  // Tożsamość i role z huba (/v1/edu/ja) - po zalogowaniu.
  useEffect(() => {
    if (!authReady || !auth.user) return;
    dispatch(fetchSesja({ roleZTokenu: roleZTokenu(auth.user) }));
  }, [authReady, auth.user, dispatch]);

  // Zapamiętanie wybranej roli i studenta (przetrwa odświeżenie strony).
  useEffect(() => {
    if (!aktywnaRola) return;
    zapiszPreferencje({
      rola: aktywnaRola,
      email: uzytkownik?.email ?? '',
      student: czyRolaAdministracyjna(aktywnaRola) ? wybranyStudent : null,
    });
  }, [aktywnaRola, wybranyStudent, uzytkownik?.email]);

  // Powiadomienia - dopiero gdy znamy token.
  useEffect(() => {
    if (authReady) {
      dispatch(fetchNotifications({ limit: 20 }));
    }
  }, [authReady, dispatch]);

  // Nowe dane po zmianie roli: ekrany studenta i wykładowcy pytają o inne
  // zasoby, a po wybraniu studenta w dziekanacie trzeba pobrać jego dane.
  // Zmiana klucza montuje treść od nowa, więc efekty stron wykonają się ponownie.
  const kluczKontekstu = `${aktywnaRola ?? 'brak'}:${wybranyStudent?.nr ?? ''}`;

  // Menu dla roli; gość (przed zalogowaniem) dostaje minimalny zestaw, żeby
  // pasek boczny nie był pusty.
  const grupyRoli = menuDlaRoli(aktywnaRola);
  const grupy = grupyRoli.length > 0 ? grupyRoli : auth.user ? [] : MENU_GOSCIA;
  const { tytul, grupa } = tytulStrony(pathname, aktywnaRola);

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${KLASY.tlo} text-slate-900`}>
      <Sidebar
        grupy={grupy}
        zwiniety={zwiniety}
        naPrzelaczenie={() => setZwiniety((wartosc) => !wartosc)}
        ladowanie={status !== 'ready' && Boolean(auth.user)}
        mobilnyOtwarty={mobilnyOtwarty}
        zamknijMobilny={() => setMobilnyOtwarty(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar tytul={tytul} grupa={grupa} naMenuMobilny={() => setMobilnyOtwarty(true)} />

        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          {authReady ? (
            <div key={kluczKontekstu}>{children}</div>
          ) : (
            <div className="flex items-center gap-2 py-8 text-xs text-slate-500">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-marka-700" />
              Sprawdzanie sesji...
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
