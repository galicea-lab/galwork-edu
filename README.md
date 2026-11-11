Projekt: Galwork
Zastosowanie: szkoły i uczelnie

Portal studenta / nauczyciela / pracownika administracji uczelni

## Role i layout

Serwis pokazuje, w jakiej roli występuje użytkownik, i dobiera do tego menu.
Role pochodzą z huba (`GET /v1/edu/ja`): `student` i `wykladowca` z rekordów
w Education, `dziekanat` i `administrator` z grup Keycloak, `kandydat` - gdy
osoba nie ma rekordu w Education. Użytkownik z kilkoma rolami przełącza je
w nagłówku; wybór jest zapamiętywany w `localStorage`.

Layout i wygląd są wydzielone, więc customizacja nie wymaga zmian w logice:

- `src/layouts/app/theme.ts` - nazwa, podtytuł, logo, uczelnia, klasy chrome'u,
- `src/layouts/app/navigation.ts` - menu (grupy i pozycje z listą ról),
  metadane ról i tytuły stron,
- `src/layouts/app/AppLayout.tsx` - sesja Keycloak, role, powiadomienia,
- `src/layouts/app/Sidebar.tsx`, `Topbar.tsx`, `RoleSwitcher.tsx`,
  `StudentPicker.tsx` - elementy interfejsu,
- `tailwind.config.js` - paleta `marka` (granat) i `akcent` (złoto).

Zmienne środowiskowe: `NEXT_PUBLIC_UCZELNIA` (nazwa uczelni),
`NEXT_PUBLIC_EDU_API_URL` (adres `/v1/edu`), `NEXT_PUBLIC_EDU_STAFF_GROUPS`,
`NEXT_PUBLIC_EDU_ADMIN_ROLES` i `NEXT_PUBLIC_EDU_CANDIDATE_GROUPS` (domyślnie
`kandydaci`; role używane tylko jako awaryjne źródło menu, gdy hub nie
odpowiada).
