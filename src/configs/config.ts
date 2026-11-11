type Config = {
  keycloak: string;
  keycloak_client: string;
  api_url: string; // /v1/wf
  edu_api_url: string; // /v1/edu
  konto_api_url: string; // usługa kont (kody jednorazowe, bez logowania)
  rekrutacja_api_url: string; // portal kandydata /v1/rekrutacja
  kalendarz_api_url: string; // kalendarz /v1/kalendarz
  // 2026-11-10: grupy i role Keycloak rozpoznawane po stronie interfejsu.
  // Służą tylko do wyboru menu, gdy hub (/v1/edu/ja) nie odpowie - o
  // uprawnieniach decyduje backend (edu/dependencies.py w galwork-hub).
  staff_groups: string[]; // pracownicy dziekanatu
  admin_roles: string[]; // administratorzy systemu
  candidate_groups: string[]; // kandydaci (realm rekrutacji)
  uczelnia: string; // nazwa uczelni w nagłówku i stopce
};

// 2026-11-10: listy po przecinku z env (NEXT_PUBLIC_*), z sensownym
// domyślnym odpowiednikiem konfiguracji huba ([edu] staff_groups,
// [keycloak] admin_groups).
const lista = (wartosc: string | undefined, domyslna: string): string[] =>
  (wartosc || domyslna)
    .split(',')
    .map((pozycja) => pozycja.trim().toLowerCase())
    .filter(Boolean);

let CONFIG: Config = {
  keycloak: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'https://login.e-talar.com/realms/rekrutacja',
  keycloak_client: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT || 'transmem',
  api_url: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8086/v1/wf/',
  // 2026-11-10: osobna zmienna dla modułu edu - wcześniej oba klienty
  // korzystały z NEXT_PUBLIC_API_URL, więc nie dało się ich rozdzielić.
  edu_api_url:
    process.env.NEXT_PUBLIC_EDU_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:8086/v1/edu/',
  konto_api_url: process.env.NEXT_PUBLIC_KONTO_API_URL ?? 'http://localhost:8086/v1/konto/',
  rekrutacja_api_url:
    process.env.NEXT_PUBLIC_REKRUTACJA_API_URL ?? 'http://localhost:8086/v1/rekrutacja/',
  kalendarz_api_url:
    process.env.NEXT_PUBLIC_KALENDARZ_API_URL ?? 'http://localhost:8086/v1/kalendarz/',
  staff_groups: lista(process.env.NEXT_PUBLIC_EDU_STAFF_GROUPS, 'dziekanat,edu-admin'),
  admin_roles: lista(process.env.NEXT_PUBLIC_EDU_ADMIN_ROLES, 'galwork-admin,wf-admin'),
  // jak [rekrutacja] candidate_group w hubie
  candidate_groups: lista(process.env.NEXT_PUBLIC_EDU_CANDIDATE_GROUPS, 'kandydaci'),
  uczelnia: process.env.NEXT_PUBLIC_UCZELNIA || 'Galwork University',
};

export default CONFIG;
