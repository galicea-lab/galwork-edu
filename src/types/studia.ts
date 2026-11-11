// typy ekranu "Moje studia" - odpowiedź /v1/edu/studia huba
// (konektor frappe_education/studia.py -> education.portal.api.get_studies).
export interface DaneStudenta {
  student: string;
  imie?: string | null;
  drugie_imie?: string | null;
  nazwisko?: string | null;
  nazwisko_pelne?: string | null;
  nr_albumu?: string | null;
  email?: string | null;
  email_prywatny?: string | null;
  telefon?: string | null;
  data_urodzenia?: string | null;
  plec?: string | null;
  obywatelstwo?: string | null;
  narodowosc?: string | null;
  kraj?: string | null;
  miasto?: string | null;
  adres?: string | null;
  nr_dowodu?: string | null;
  nr_paszportu?: string | null;
  zdjecie?: string | null;
  data_przyjecia?: string | null;
}

export interface ZapisNaKierunek {
  id: string;
  kierunek?: string | null;
  kierunek_nazwa?: string | null;
  kierunek_skrot?: string | null;
  stopien?: string | null;
  tryb?: string | null;
  rok_akademicki?: string | null;
  semestr?: string | null;
  data_zapisu?: string | null;
  grupa?: string | null;
  kategoria?: string | null;
  platne: boolean;
}

export interface StatusSemestru {
  id: string;
  rok_akademicki?: string | null;
  semestr?: string | null;
  nr_semestru?: number | null;
  status?: string | null;
  letni: boolean;
  do_sredniej: boolean;
  zaplacony: boolean;
  data_decyzji?: string | null;
  data_rejestracji?: string | null;
}

export interface MojeStudia {
  student: DaneStudenta;
  zapisy: ZapisNaKierunek[];
  semestry: StatusSemestru[];
  aktualny_zapis?: ZapisNaKierunek | null;
  aktualny_semestr?: StatusSemestru | null;
  ustawienia: Record<string, string | null>;
}

export interface StudiaResponse {
  code: number;
  message: string;
  studia?: MojeStudia | null;
}
