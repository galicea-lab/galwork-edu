//  typy ekranu legitymacji mLegitymacja - odpowiedź
// /v1/edu/legitymacja* huba (konektor frappe_education/student_card.py).
export type StanLegitymacji = 'none' | 'ordered' | 'issued';

export interface Legitymacja {
  student: string;
  stan: StanLegitymacji;
  zamowienie?: string | null;
  rodzaj?: string | null;
  status?: string | null;
  mls_status?: string | null;
  numer_mls?: string | null;
  nr_karty?: string | null;
  wazna_od?: string | null;
  wazna_do?: string | null;
  termin_qr?: string | null;
  blad?: string | null;
  zamowiono?: string | null;
  kody_dostepne: boolean;
}

export interface LegitymacjaResponse {
  code: number;
  message: string;
  legitymacja?: Legitymacja | null;
}

export interface KodyLegitymacji {
  zamowienie: string;
  qr: string;
  kod_aktywacyjny: string;
  wazny_do?: string | null;
  ostrzezenie?: string | null;
}

export interface KodyLegitymacjiResponse {
  code: number;
  message: string;
  kody?: KodyLegitymacji | null;
}

export interface ZamowienieLegitymacji {
  zamowienie: string;
  rodzaj?: string | null;
  status?: string | null;
  blad?: string | null;
}

export interface ZamowienieResponse {
  code: number;
  message: string;
  zamowienie?: ZamowienieLegitymacji | null;
}
