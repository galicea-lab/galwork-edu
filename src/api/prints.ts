// 2026-11-16: wydruki PDF instancji procesów (GET /prints, GET /print.pdf, POST /print).
import axios from 'axios';
import { apiClient } from './client';
import { PrintOption, PrintOptionList, PrintDocumentRole } from '@/types/prints';

const params = (option?: Pick<PrintOption, 'task_id' | 'template'> | null) => ({
  ...(option?.task_id ? { task_id: option.task_id } : {}),
  ...(option?.template ? { template: option.template } : {}),
});

/** Plik z nagłówka Content-Disposition (filename* w UTF-8 ma pierwszeństwo). */
const fileName = (disposition: string | undefined, fallback: string): string => {
  const utf = disposition?.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf) return decodeURIComponent(utf[1]);
  const plain = disposition?.match(/filename="?([^";]+)"?/i);
  return plain ? plain[1] : fallback;
};

/** Komunikat błędu także dla odpowiedzi typu Blob (responseType: 'blob'). */
export const extractPrintError = async (error: unknown): Promise<string> => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    try {
      const body = data instanceof Blob ? JSON.parse(await data.text()) : data;
      if (typeof body?.detail === 'string') return body.detail;
    } catch {
      // treść nie jest JSON - komunikat ogólny niżej
    }
    if (error.response?.status === 403) return 'Brak uprawnień do wydruku tej sprawy.';
  }
  return 'Nie udało się przygotować wydruku.';
};

export const printsApi = {
  /** Wydruki dostępne dla instancji (albo konkretnego zadania). */
  async listPrints(instanceId: string, taskId?: string): Promise<PrintOption[]> {
    const response = await apiClient.get<PrintOptionList>(`/process-instances/${instanceId}/prints`, {
      params: taskId ? { task_id: taskId } : undefined,
    });
    return response.data.items;
  },

  /** PDF wydruku jako Blob + nazwa pliku. */
  async downloadPdf(instanceId: string, option: PrintOption): Promise<{ blob: Blob; fileName: string }> {
    const response = await apiClient.get<Blob>(`/process-instances/${instanceId}/print.pdf`, {
      params: params(option),
      responseType: 'blob',
      timeout: 120000,
    });
    return {
      blob: response.data,
      fileName: fileName(response.headers['content-disposition'] as string | undefined, 'wydruk.pdf'),
    };
  },

  /** PDF jako dokument sprawy (nowa wersja, jeśli już istnieje) i wysyłka do Paperless. */
  async archive(instanceId: string, option: PrintOption, role: PrintDocumentRole = 'main') {
    const response = await apiClient.post(
      `/process-instances/${instanceId}/print`,
      { task_id: option.task_id, template: option.template, role },
      { timeout: 120000 }
    );
    return response.data as { id: string; title: string; current_version_no: number | null };
  },
};
