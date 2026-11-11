// klient API listy studentów (/v1/edu/studenci) - wyszukiwarka
// studenta dla roli dziekanatu (kontekst ekranów studenckich). Endpoint
// zwraca wszystkich aktywnych studentów, więc pobieramy listę raz i filtrujemy
// ją lokalnie (patrz componentes/layouts/app/StudentPicker.tsx).
import { eduClient } from './client';

export interface StudentListy {
  nr: string;
  email: string;
  imie_i: string;
  imie_ii?: string;
  nazwisko: string;
  nr_semestru?: number;
}

export interface StudenciResponse {
  code: number;
  message: string;
  studenci?: StudentListy[] | null;
}

export const studenciApi = {
  /** Aktywni studenci (opcjonalnie rok akademicki, semestr, kierunek). */
  async list(
    params: {
      rok?: string;
      letni?: number;
      kierunek?: string;
      nr_semestru?: number;
    } = {}
  ): Promise<StudenciResponse> {
    const response = await eduClient.get<StudenciResponse>('/studenci', { params });
    return response.data;
  },
};
