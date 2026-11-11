import { useState, useEffect, useMemo } from 'react'
import { Icon } from '@iconify/react'

import { useDispatch, useSelector } from 'react-redux'

import {  setCurrentFormN,
          fetchList, setEdForm, setJForm } from '@/store/jform'
import { RootState, AppDispatch } from 'src/store'


import TableHeader from '@/components/common/TableHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@galicea-lab/nextjs-keycloak-auth'

import { CASE_STATUS_LABELS, Item, api_get_jform, downloadAttachment, jFormResult } from '@/api/jform'
import Attach from '@/components/common/Attach'


const JFormList = () => {
  const [value, setValue] = useState<string>('')
  const [selId, setID] = useState<string>('')

  const dispatch = useDispatch<AppDispatch>()
  const store = useSelector((state: RootState) => state.jform)
  const { t } = useTranslation()
  const auth = useAuth()

  // 2026-11-06: identyfikatory spraw to nazwy dokumentów Frappe (string),
  // a załącznik pobieramy z /jform/sprawa/attachment (zamiast WEBCON
  // /lastattachement); nazwę pliku podaje hub w Content-Disposition.
  const onDownload = (id: string) => {
    downloadAttachment(id).catch((err) => {
      console.log(err);
      alert(err?.response?.status == 404 ? 'Sprawa nie ma załączników' : t('Operation failed!'));
    });
  };

  useEffect(() => {
    if (auth.user) {
      dispatch(fetchList())
    }
  }, [dispatch, auth.user])

  const getJForms = (id: string) => {
    api_get_jform(id)
      .then((response: jFormResult) => {
        if (response.code == 0) {
          dispatch(
            setJForm({ element: id, schema: response.schema,
              uiSchema: response.uischema,
              cdata: response.data, meta: response.case })
          )
          dispatch(setEdForm(true))
        } else {
          alert(t('Failed connection with server!') + ': ' + response.message);
        }
      })
      .catch(error => {
        console.log('Operation failed!! ' + JSON.stringify(error));
        alert(t('Operation failed!'));
      });
  }

  const filteredItems = useMemo(() => {
    const items: Item[] = store?.items || []
    if (!value.trim()) return items
    const q = value.trim().toLowerCase()
    return items.filter((row) =>
      [row.Rodzaj_sprawy, row.Temat, row.Step, row.ID]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    )
  }, [store?.items, value])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <TableHeader value={value} handleFilter={setValue} />

        {filteredItems.length === 0 ? (
          <EmptyState
            icon="mdi:file-document-outline"
            title="Brak dokumentów"
            description="Nie znaleziono żadnych spraw spełniających podane kryteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">{t('Title')}</th>
                  <th className="px-4 py-3">{t('Date')}</th>
                  <th className="px-4 py-3">Temat</th>
                  <th className="px-4 py-3">{t('Status')}</th>
                  <th className="px-4 py-3 text-right">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setID(row.ID)}
                  >
                    <td className="px-4 py-3 font-mono text-slate-500">{row.ID}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.Rodzaj_sprawy}</td>
                    <td className="px-4 py-3 text-slate-600">{row.Data}</td>
                    <td className="px-4 py-3 text-slate-600">{row.Temat}</td>
                    <td className="px-4 py-3 text-slate-600">{CASE_STATUS_LABELS[row.Step] || row.Step}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onDownload(row.ID)}
                          title={t('Download')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Icon icon="mdi:download" className="w-3.5 h-3.5" />
                          {t('Download')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            dispatch(setCurrentFormN(row.Rodzaj_sprawy))
                            getJForms(row.ID);
                          }}
                          title={row.Step == 'Draft' ? t('Fill') : 'Podgląd'}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                        >
                          <Icon icon={row.Step == 'Draft' ? 'mdi:pencil' : 'mdi:eye'} className="w-3.5 h-3.5" />
                          {row.Step == 'Draft' ? t('Fill') : 'Podgląd'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setID(row.ID)}
                          title="Przekaż załącznik"
                          className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                        >
                          <Icon icon="mdi:paperclip" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selId && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <h3 className="text-xs font-semibold text-slate-700 mb-2">Przekaż załącznik do sprawy {selId}:</h3>
          <Attach id={selId} />
        </div>
      )}
    </div>
  )
}

export default JFormList
