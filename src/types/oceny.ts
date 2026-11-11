// Typy siatki ocen wykładowcy - odpowiedź /v1/edu/oceny/grupa
// huba, który mapuje education.portal.api.get_group_assessments,
// get_group_roster i save_group_results (konektor frappe_education/oceny.py).
export interface KryteriumPlanu {
  kryterium: string;
  maksimum: number;
  waga: number;
}

export interface PlanOceniania {
  id: string;
  nazwa?: string | null;
  przedmiot?: string | null;
  grupa?: string | null;
  grupa_ocen?: string | null;
  skala?: string | null;
  maksimum: number;
  data?: string | null;
  semestr?: string | null;
  rok_akademicki?: string | null;
  zatwierdzony: boolean;
  kryteria: KryteriumPlanu[];
  wystawione: number;
}

export interface StudentGrupy {
  student: string;
  nazwisko?: string | null;
  nr_albumu?: string | null;
  zdjecie?: string | null;
  nr_w_grupie?: number | null;
}

export interface OcenyGrupyResponse {
  code: number;
  message: string;
  grupa?: string | null;
  wykladowca?: string | null;
  plany: PlanOceniania[];
  studenci: StudentGrupy[];
}

export interface WpisOceny {
  student: string;
  punkty: Record<string, number>;
  suma?: number;
  komentarz?: string | null;
}

export interface ZapisOcenResponse {
  code: number;
  message: string;
  wynik?: {
    grupa: string;
    assessment_plan: string;
    zapisane: Array<{ student: string; assessment_result: string; docstatus: number }>;
    count: number;
  } | null;
}


// karta ocen studenta (/v1/edu/oceny) - przedmioty z podejściami,
// średnia ważona ECTS i rozliczenie semestrów (Student Academic Status).
export interface PodejscieOceny {
  id: string;
  plan?: string | null;
  data?: string | null;
  punkty: number;
  maksimum: number;
  procent?: number | null;
  ocena?: string | null;
  zaliczone?: boolean | null;
}

export interface PrzedmiotOceny {
  code: string;
  name?: string | null;
  ects: number;
  passing_type?: string | null;
}

export interface OcenaPrzedmiotu {
  przedmiot: PrzedmiotOceny;
  rok_akademicki?: string | null;
  semestr?: string | null;
  final?: PodejscieOceny | null;
  podejscia: PodejscieOceny[];
  zaliczone?: boolean | null;
  najlepszy_procent?: number | null;
}

export interface SredniaOcen {
  metoda: string;
  wartosc?: number | null;
  przedmioty: number;
  zaliczone: number;
  niezaliczone: number;
}

export interface SemestrStatus {
  id: string;
  zapis?: string | null;
  rok_akademicki?: string | null;
  semestr?: string | null;
  nr_semestru?: number | null;
  status?: string | null;
  letni?: boolean | null;
  do_sredniej?: boolean | null;
  zaplacony?: boolean | null;
  data_decyzji?: string | null;
}

export interface KartaOcen {
  student: string;
  prog_zaliczenia: number;
  przedmioty: OcenaPrzedmiotu[];
  srednia: SredniaOcen;
  semestry: SemestrStatus[];
}

export interface KartaOcenResponse {
  code: number;
  message: string;
  oceny?: KartaOcen | null;
}
