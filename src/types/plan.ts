// typy planu zajęć - odpowiedź /v1/edu/plan huba, który z kolei
// mapuje education.portal.api.get_schedule (konektor frappe_education/plan.py).
export type TrybPlanu = 'student' | 'wykladowca';

export interface PrzedmiotPlanu {
  code: string;
  name: string;
  type?: string | null;
}

export interface WpisPlanu {
  id: string;
  data: string;
  dzien_tygodnia?: number | null;
  od: string;
  do: string;
  przedmiot: PrzedmiotPlanu;
  grupa: string;
  sala?: string | null;
  wykladowca?: string | null;
  kierunek?: string | null;
  tytul?: string | null;
  kolor?: string | null;
}

export interface Plan {
  od: string;
  do: string;
  wpisy: WpisPlanu[];
}

export interface PlanResponse {
  code: number;
  message: string;
  plan?: Plan | null;
}

export interface InstruktorInfo {
  name: string;
  instructor_name?: string | null;
  department?: string | null;
  image?: string | null;
}

export interface GrupaWykladowcy {
  name: string;
  student_group_name?: string | null;
  course?: string | null;
  program?: string | null;
  academic_year?: string | null;
  academic_term?: string | null;
  max_strength?: number | null;
  students?: number;
}

export interface PrzedmiotWykladowcy {
  code: string;
  name?: string | null;
}

export interface KontekstWykladowcy {
  instructor?: InstruktorInfo;
  academic_term?: string | null;
  groups?: GrupaWykladowcy[];
  courses?: PrzedmiotWykladowcy[];
}

export interface KontekstResponse {
  code: number;
  message: string;
  kontekst?: KontekstWykladowcy | null;
}
