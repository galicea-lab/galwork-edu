import React, { useState } from 'react';
import Head from 'next/head';
import { SchemaForm } from '@/components';
import { formFixtures } from '@/components/forms/__fixtures__';
import { Icon } from '@iconify/react';

/**
 * Podgląd uniwersalnych formularzy (RJSF) na lokalnych fixture'ach.
 *
 */
export default function FormsDemoPage() {
  const [activeKey, setActiveKey] = useState<string>(formFixtures[0].key);
  const active = formFixtures.find((f) => f.key === activeKey) ?? formFixtures[0];
  const [formData, setFormData] = useState<Record<string, unknown>>({
    ...active.data,
  });

  const handleSelect = (key: string) => {
    const fixture = formFixtures.find((f) => f.key === key);
    if (!fixture) return;
    setActiveKey(key);
    setFormData({ ...fixture.data });
  };

  return (
    <>
      <Head>
        <title>Formularze | Galwork Edu</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Formularze Spiff-Arena</h1>
          <p className="text-xs text-slate-500 mt-1">
            Podgląd JSON Schema + uiSchema renderowanych przez react-jsonschema-form (te same
            schematy, które serwer zwraca dla zadań i startu procesów)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 space-y-2">
            {formFixtures.map((fixture) => (
              <button
                key={fixture.key}
                type="button"
                onClick={() => handleSelect(fixture.key)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-colors ${
                  fixture.key === activeKey
                    ? 'border-blue-300 bg-blue-50 text-blue-800 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Icon icon="mdi:form-textbox" className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{fixture.label}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">{active.label}</h2>
                <button
                  type="button"
                  onClick={() => setFormData({ ...active.data })}
                  className="px-2.5 py-1.5 text-[11px] font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Wyczyść dane
                </button>
              </div>

              <SchemaForm
                schema={active.schema}
                uiSchema={active.uiSchema}
                formData={formData}
                onChange={setFormData}
              />
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-xl border border-slate-200 bg-slate-900 p-4">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                formData (wynik formularza)
              </p>
              <pre className="text-[11px] leading-relaxed text-emerald-300 overflow-auto max-h-[32rem] whitespace-pre-wrap break-all">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
