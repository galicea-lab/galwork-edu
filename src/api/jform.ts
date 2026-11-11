// 2026-11-06: korespondencja z dziekanatem - klient endpointów
// /v1/edu/jform/sprawa/* huba (edu/routers/korespondencja_api.py), źródłem
// danych jest Frappe Education (`Student Correspondence`). Usunięto wywołania
// WEBCON (/report/secured, /lastattachement, /helpdesk, /mls/*, /ko/*), które
// hub już nie wystawia; wersja sprzed zmian jest w dev/legacy/jform.ts.
// mLegitymacja i karta obiegowa wrócą jako procesy BPMN (todo_edu.md, etapy 2-3).
// Token dodaje `eduClient` (api/client.ts), stąd brak parametru `token`.
import { eduClient } from './client';

export interface WResult {
  code: number;
  message: string;
  result?: unknown;
}

export interface FormType {
  id: string;   // nazwa dokumentu `Correspondence Type` (= type_name)
  name: string;
}

export interface FormtypesResult {
  code: number;
  message: string;
  result: FormType[];
}

/** Wiersz listy spraw (connector/frappe_education/correspondence.py: correspondence_to_item). */
export interface Item {
  id: string;
  ID: string;            // nazwa dokumentu Frappe, np. EDU-COR-2026-00001
  Step: string;
  Rodzaj_sprawy: string;
  Akronim: string;
  Sygnatura: string;
  Student: string;
  Status: string;
  Data: string;
  tm: string;
  Temat?: string;
  Odpowiedz?: string;
}

/** Status sprawy (Frappe `Student Correspondence.status`) po polsku. */
export const CASE_STATUS_LABELS: Record<string, string> = {
  'Draft': 'Szkic',
  'Submitted': 'Złożone',
  'In Progress': 'Do uzupełnienia',
  'Awaiting Signature': 'Do podpisu',
  'Signed': 'Podpisane',
  'Completed': 'Załatwione',
  'Rejected': 'Odmowa',
  'Cancelled': 'Anulowane',
};

export interface CaseMeta {
  status: string;
  subject: string;
  response: string;
  response_date: string;
  process_instance_id: string;
}

export interface itemListResult {
  code: number;
  message: string;
  list: Item[];
}

export interface NewForm {
  formtype: string;      // FormType.id
  kierunek?: string;
}

export interface newFormResult {
  code: number;
  message: string;
  inst: { id: string; instanceNumber: string; status: string };
  schema: any;
  uischema: any;
  data: any;
}

export interface jFormResult {
  code: number;
  message: string;
  schema: any;
  uischema: any;
  data: any;
  case?: CaseMeta;
}

export interface SubmitResult {
  code: number;
  message: string;
  process_instance_id?: string;
  status?: string;
}

export interface Attachment {
  id: string;
  file_name: string;
  creation: string;
}

export interface AttachmentsResult {
  code: number;
  message: string;
  result: Attachment[];
}

/** Typy spraw (słownik `Correspondence Type`). */
export const api_form_types = async (): Promise<FormtypesResult> =>
  (await eduClient.get<FormtypesResult>('/jform/sprawa/formtypes')).data;

/** Sprawy zalogowanego studenta (hub rozpoznaje go po e-mailu z tokenu). */
export const api_items_lista = async (): Promise<itemListResult> =>
  (await eduClient.get<itemListResult>('/jform/sprawa/list')).data;

export const api_post_new_form = async (request: NewForm): Promise<newFormResult> =>
  (await eduClient.post<newFormResult>('/jform/sprawa/new', null, { params: request })).data;

export const api_get_jform = async (id: string): Promise<jFormResult> =>
  (await eduClient.get<jFormResult>('/jform/sprawa/form', { params: { id } })).data;

export const api_jform_update = async (id: string, data: any): Promise<WResult> =>
  (await eduClient.post<WResult>('/jform/sprawa/update', data, { params: { id } })).data;

// 2026-11-06: złożenie pisma uruchamia proces BPMN (np. edu-pismo); potem
// formularz sprawy jest tylko do odczytu, a uzupełnienia idą przez zadania.
export const api_submit_case = async (id: string): Promise<SubmitResult> =>
  (await eduClient.post<SubmitResult>('/jform/sprawa/submit', null, { params: { id } })).data;

export const uploadFile = async (id: string, selectedFile: File): Promise<WResult> => {
  const form = new FormData();
  form.append('id', id);
  form.append('att_name', selectedFile.name);
  form.append('file', selectedFile);
  // Content-Type (z boundary) ustawia przeglądarka dla FormData.
  return (await eduClient.post<WResult>('/jform/sprawa/attach', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })).data;
};

export const api_list_attachments = async (id: string): Promise<AttachmentsResult> =>
  (await eduClient.get<AttachmentsResult>('/jform/sprawa/attachments', { params: { id } })).data;

const filenameFromDisposition = (header: string | undefined, fallback: string): string => {
  if (!header) return fallback;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8) return decodeURIComponent(utf8[1]);
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain ? plain[1] : fallback;
};

/** Pobiera załącznik sprawy (bez `attId` - najnowszy) i zapisuje go w przeglądarce. */
export const downloadAttachment = async (id: string, attId = ''): Promise<void> => {
  const response = await eduClient.get<Blob>('/jform/sprawa/attachment', {
    params: { id, att_id: attId },
    responseType: 'blob',
  });
  const filename = filenameFromDisposition(response.headers['content-disposition'], 'zalacznik');
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
