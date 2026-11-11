// Typy ekranu opłat - odpowiedź /v1/edu/oplaty huba
// (konektor frappe_education/oplaty.py -> education.portal.api.get_fees).
export type StanOplaty = 'paid' | 'due' | 'overdue';

export interface Oplata {
  id: string;
  data_wystawienia?: string | null;
  termin?: string | null;
  waluta?: string | null;
  kwota: number;
  zaleglosc: number;
  stan: StanOplaty;
  kierunek?: string | null;
  rok_akademicki?: string | null;
  semestr?: string | null;
}

export interface Oplaty {
  student: string;
  oplaty: Oplata[];
  suma_zaleglosci: number;
  suma_zaplacona: number;
  suma_przeterminowana: number;
  wymaga_zaplaty: boolean;
}

export interface OplatyResponse {
  code: number;
  message: string;
  oplaty?: Oplaty | null;
}
