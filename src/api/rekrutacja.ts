// rekrutacja - usługa kont huba (/v1/konto: kody jednorazowe,
// założenie konta, nowe hasło; bez tokenu - kod nie loguje) i portal
// kandydata (/v1/rekrutacja: dane osobowe w Frappe, token realmu kandydatów).
import axios from 'axios';
import CONFIG from '@/configs/config';
import { getAuthToken } from './client';

const base = (url: string) => url.replace(/\/+$/, '');

// bez nagłówka Authorization - usługa kont jest publiczna (CAPTCHA, limity)
const kontoClient = axios.create({
  baseURL: base(CONFIG.konto_api_url),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

const rekrutacjaClient = axios.create({
  baseURL: base(CONFIG.rekrutacja_api_url),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});
rekrutacjaClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type Kanal = 'sms' | 'email';

export interface KontoKonfiguracja {
  channels: Kanal[];
  sms_country_codes: string[];
  pesel: 'off' | 'optional' | 'required';
  captcha_site_key: string | null;
  code_length: number;
  code_ttl: number;
  operations_quota: number;
  login_gov_pl: boolean;
}

export interface Przepustka {
  ticket: string;
  expires_in: number;
  resend_after: number;
  message: string;
}

export interface Rejestracja {
  ticket: string;
  code: string;
  email: string;
  phone?: string | null;
  first_name: string;
  last_name: string;
  password: string;
  pesel?: string | null;
}

export interface Profil {
  name: string;
  email: string;
  first_name?: string | null;
  second_name?: string | null;
  last_name?: string | null;
  family_name?: string | null;
  fathers_name?: string | null;
  mothers_name?: string | null;
  pesel?: string | null;
  no_pesel?: boolean;
  identity_document_type?: string | null;
  identity_document_number?: string | null;
  date_of_birth?: string | null;
  place_of_birth?: string | null;
  gender?: string | null;
  citizenship?: string | null;
  phone?: string | null;
  street?: string | null;
  building_number?: string | null;
  flat_number?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
}

export interface Slowniki {
  genders: string[];
  countries: string[];
  identity_document_types: string[];
}

export interface Kierunek {
  name: string;
  campaign: string;
  code: string;
  program: string;
  title?: string | null;
  status: 'Open' | 'Closed';
  admission_limit?: number | null;
  application_fee?: number | null;
}

export interface DokumentZgloszenia {
  document: string;
  status: 'Missing' | 'Submitted' | 'Verified' | 'Rejected';
}

export interface Zgloszenie {
  name: string;
  campaign: string;
  admission_programme: string;
  programme_title?: string | null;
  round_number: number;
  priority: number;
  submission_status: 'Draft' | 'Submitted' | 'Withdrawn';
  fee_status: 'Unpaid' | 'Paid' | 'Exempt' | 'Refund';
  qualification_status?: '' | 'Qualified' | 'Reserve' | 'Not Qualified' | null;
  admission_status?: '' | 'Admitted' | 'Resigned' | 'Not Admitted' | 'Cancelled' | null;
  score?: number | null;
  rank_position?: number | null;
  submitted_on?: string | null;
  documents?: DokumentZgloszenia[];
}

export interface Decyzja {
  name: string;
  decision_type: string;
  decision_number?: string | null;
  status: 'Published' | 'Delivered';
  application: string;
  admission_programme: string;
  programme_title?: string | null;
  round_number: number;
  issue_date?: string | null;
  published_on?: string | null;
  delivered_on?: string | null;
  can_download: boolean;
}

export interface Tura {
  round_number: number;
  start_date?: string | null;
  end_date?: string | null;
}

export interface KampaniaHarmonogram {
  name: string;
  title: string;
  academic_year?: string | null;
  application_start?: string | null;
  application_end?: string | null;
  description?: string | null;
  programmes: Array<{ name: string; title?: string | null; status: string; rounds: Tura[] }>;
}

export const kontoApi = {
  async konfiguracja(): Promise<KontoKonfiguracja> {
    return (await kontoClient.get<KontoKonfiguracja>('/konfiguracja')).data;
  },
  async kodRejestracji(channel: Kanal, destination: string, captcha: string | null): Promise<Przepustka> {
    return (await kontoClient.post<Przepustka>('/rejestracja/kod', { channel, destination, captcha })).data;
  },
  async rejestracja(dane: Rejestracja): Promise<{ username: string; login_url: string | null }> {
    return (await kontoClient.post('/rejestracja', dane)).data;
  },
  async kodResetu(login: string, captcha: string | null): Promise<Przepustka> {
    return (await kontoClient.post<Przepustka>('/reset/kod', { login, captcha })).data;
  },
  async reset(ticket: string, code: string, password: string): Promise<void> {
    await kontoClient.post('/reset', { ticket, code, password });
  },
  async ponow(ticket: string, destination?: string): Promise<Przepustka> {
    return (await kontoClient.post<Przepustka>('/kod/ponow', { ticket, destination })).data;
  },
};

export const rekrutacjaApi = {
  async profil(): Promise<Profil> {
    return (await rekrutacjaClient.get<Profil>('/profil')).data;
  },
  async zapiszProfil(dane: Partial<Profil>): Promise<Profil> {
    return (await rekrutacjaClient.put<Profil>('/profil', dane)).data;
  },
  async slowniki(): Promise<Slowniki> {
    return (await rekrutacjaClient.get<Slowniki>('/slowniki')).data;
  },
  // publiczne - bez logowania
  async kierunki(): Promise<Kierunek[]> {
    return (await rekrutacjaClient.get<Kierunek[]>('/kierunki')).data;
  },
  async harmonogram(): Promise<KampaniaHarmonogram[]> {
    return (await rekrutacjaClient.get<KampaniaHarmonogram[]>('/harmonogram')).data;
  },
  async zgloszenia(): Promise<Zgloszenie[]> {
    return (await rekrutacjaClient.get<Zgloszenie[]>('/zgloszenia')).data;
  },
  async zglos(kierunek: string, priorytet?: number): Promise<Zgloszenie> {
    return (await rekrutacjaClient.post<Zgloszenie>('/zgloszenia', { kierunek, priorytet })).data;
  },
  async wycofaj(zgloszenie: string): Promise<Zgloszenie> {
    return (await rekrutacjaClient.post<Zgloszenie>(`/zgloszenia/${encodeURIComponent(zgloszenie)}/wycofanie`)).data;
  },
  async decyzje(): Promise<Decyzja[]> {
    return (await rekrutacjaClient.get<Decyzja[]>('/decyzje')).data;
  },
};
