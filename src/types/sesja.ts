// role użytkownika w serwisie studenckim i tożsamość z huba
// (GET /v1/edu/ja). Jedno miejsce definiuje nazwy ról używane w menu,
// przełączniku roli i zapisie wybranej roli.
export type Rola = 'student' | 'wykladowca' | 'dziekanat' | 'administrator' | 'kandydat';

/** Student w Education - numer albumu i dane do nagłówka. */
export interface StudentTozsamosc {
  student: string;
  nr_albumu?: string | null;
  imie?: string | null;
  drugie_imie?: string | null;
  nazwisko?: string | null;
  imie_nazwisko?: string | null;
  email?: string | null;
  zdjecie?: string | null;
}

/** Wykładowca w Education - rekord `Instructor`. */
export interface WykladowcaTozsamosc {
  instructor: string;
  imie_nazwisko?: string | null;
  wydzial?: string | null;
  email?: string | null;
  zdjecie?: string | null;
}

/** Zalogowany użytkownik i role, w których może wystąpić. */
export interface Uzytkownik {
  email: string;
  nazwa: string;
  username: string;
  role: Rola[];
  student?: StudentTozsamosc | null;
  wykladowca?: WykladowcaTozsamosc | null;
  dziekanat: boolean;
  administrator: boolean;
}

export interface JaResponse {
  code: number;
  message: string;
  ostrzezenie?: string;
  uzytkownik?: Uzytkownik | null;
}

/** Student wybrany przez dziekanat (kontekst ekranów studenckich). */
export interface WybranyStudent {
  nr: string;
  nazwisko?: string;
  imie?: string;
  semestr?: number;
}
