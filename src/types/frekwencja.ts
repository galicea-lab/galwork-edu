// typy ekranu frekwencji - odpowiedzi /v1/edu/frekwencja* huba
// (konektor frappe_education/frekwencja.py -> education.portal.api.*).
export interface FrekwencjaOgolem {
  obecny: number;
  nieobecny: number;
  procent?: number | null;
}

export interface FrekwencjaGrupa {
  grupa: string;
  nazwa?: string | null;
  przedmiot?: string | null;
  obecny: number;
  nieobecny: number;
  urlop: number;
  procent?: number | null;
}

export interface Nieobecnosc {
  data: string;
  grupa?: string | null;
  zajecia?: string | null;
  frekwencja?: string | null;
  usprawiedliwiona: boolean;
}

export interface FrekwencjaStudenta {
  student: string;
  ogolem: FrekwencjaOgolem;
  grupy: FrekwencjaGrupa[];
  nieobecnosci: Nieobecnosc[];
}

export interface FrekwencjaResponse {
  code: number;
  message: string;
  frekwencja?: FrekwencjaStudenta | null;
}

export type StatusObecnosci = 'Present' | 'Absent' | 'Leave';

export interface WpisObecnosci {
  student: string;
  nazwisko?: string | null;
  nr_albumu?: string | null;
  zdjecie?: string | null;
  nr_w_grupie?: number | null;
  status?: StatusObecnosci | null;
  frekwencja?: string | null;
}

export interface ListaObecnosci {
  grupa: string;
  data: string;
  wpisy: WpisObecnosci[];
  data_zamrozenia?: string | null;
}

export interface ListaObecnosciResponse {
  code: number;
  message: string;
  lista?: ListaObecnosci | null;
}

export interface ZapisObecnosciResponse {
  code: number;
  message: string;
  wynik?: {
    grupa: string;
    data: string;
    zapisane: string[];
    pominiete: Array<{ student?: string; reason?: string }>;
  } | null;
}
