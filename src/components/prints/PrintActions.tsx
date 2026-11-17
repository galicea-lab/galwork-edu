/**
 * 2026-11-16: wydruki PDF sprawy - "Pobierz PDF" dla szablonów zdefiniowanych
 * w obiegu (`x-print` w schemacie formularza) i wydruku standardowego oraz
 * zapis wydruku w dokumentach sprawy (archiwum Paperless, na żądanie).
 * Lista przychodzi z `GET /process-instances/{id}/prints`; bez uprawnień
 * do wydruku blok się nie pokazuje.
 */
import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { printsApi, extractPrintError } from '@/api/prints';
import { PrintOption } from '@/types/prints';

interface PrintActionsProps {
  instanceId: string;
  /** Zadanie, którego dane drukujemy; brak = wydruki całej sprawy. */
  taskId?: string;
  /** Zapis w dokumentach sprawy (archiwum); domyślnie dostępny. */
  allowArchive?: boolean;
  title?: string;
}

const saveBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export const PrintActions: React.FC<PrintActionsProps> = ({
  instanceId,
  taskId,
  allowArchive = true,
  title = 'Wydruki PDF',
}) => {
  const [loaded, setLoaded] = useState<{ key: string; options: PrintOption[] } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const loadKey = `${instanceId}:${taskId ?? ''}`;

  useEffect(() => {
    let cancelled = false;
    printsApi
      .listPrints(instanceId, taskId)
      .then((options) => {
        if (!cancelled) setLoaded({ key: loadKey, options });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ key: loadKey, options: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [instanceId, taskId, loadKey]);

  const options = loaded?.key === loadKey ? loaded.options : [];
  if (options.length === 0) return null;

  const download = async (option: PrintOption) => {
    setBusy(`pdf:${option.key}`);
    setError(null);
    setNotice(null);
    try {
      const { blob, fileName } = await printsApi.downloadPdf(instanceId, option);
      saveBlob(blob, fileName);
    } catch (err) {
      setError(await extractPrintError(err));
    } finally {
      setBusy(null);
    }
  };

  const archive = async (option: PrintOption) => {
    setBusy(`archive:${option.key}`);
    setError(null);
    setNotice(null);
    try {
      const document = await printsApi.archive(instanceId, option);
      setNotice(
        `Zapisano w dokumentach sprawy: ${document.title}` +
          (document.current_version_no && document.current_version_no > 1
            ? ` (wersja ${document.current_version_no})`
            : '')
      );
    } catch (err) {
      setError(await extractPrintError(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-4">
        Dokumenty generowane z aktualnych danych formularza.
        {allowArchive &&
          ' Zapis w dokumentach sprawy tworzy nową wersję dokumentu i przekazuje go do archiwum.'}
      </p>
      <ul className="divide-y divide-slate-100">
        {options.map((option) => (
          <li key={option.key} className="py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs">
              <span className={`font-semibold ${option.is_default ? 'text-slate-600' : 'text-slate-900'}`}>
                {option.label}
              </span>
              {option.task_name && !taskId && (
                <span className="ml-2 text-slate-400">krok: {option.task_name}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => download(option)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <Icon
                  icon={busy === `pdf:${option.key}` ? 'mdi:loading' : 'mdi:file-pdf-box'}
                  className={`w-4 h-4 ${busy === `pdf:${option.key}` ? 'animate-spin' : ''}`}
                />
                Pobierz PDF
              </button>
              {allowArchive && (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => archive(option)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Icon
                    icon={busy === `archive:${option.key}` ? 'mdi:loading' : 'mdi:archive-arrow-down-outline'}
                    className={`w-4 h-4 ${busy === `archive:${option.key}` ? 'animate-spin' : ''}`}
                  />
                  Zapisz w dokumentach sprawy
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {error && <p className="mt-3 text-xs text-rose-700">{error}</p>}
      {notice && (
        <p className="mt-3 text-xs text-emerald-700 flex items-center gap-1.5">
          <Icon icon="mdi:check-circle-outline" className="w-4 h-4" />
          {notice}
        </p>
      )}
    </div>
  );
};

export default PrintActions;
