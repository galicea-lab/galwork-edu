import { useState } from 'react';
import { Icon } from '@iconify/react';

import { SchemaForm } from '@/components/forms';
import { CaseMeta, CASE_STATUS_LABELS, api_jform_update, api_submit_case } from '@/api/jform';
import { setEdForm, fetchList, progressBarUp, progressBarReset } from '@/store/jform'

import { useTranslation } from 'react-i18next';

import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store'


// 2026-11-06: szkic pisma można zapisać albo zapisać i złożyć (start
// procesu edu-pismo); złożone pismo jest tylko do odczytu, z odpowiedzią
// dziekanatu. Uzupełnienie, o które prosi dziekanat, student wykonuje jako
// zadanie w "Zadaniach" (/tasks).
const FormUpdate = (props : {id: string, schema : any, uiSchema : any, cdata : any, meta? : CaseMeta}) => {
  const [data, setData] = useState<any>(props.cdata || {});
  const [error, setError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()

  const status = props.meta?.status || 'Draft'
  const editable = status === 'Draft' && !props.meta?.process_instance_id

  const save = async (): Promise<boolean> => {
    const response = await api_jform_update(props.id, data)
    if (response.code != 0) {
      setError(response.message)
      return false
    }
    return true
  }

  const run = (submit: boolean) => {
    setError(null)
    dispatch(progressBarUp(1))
    save()
      .then(async (saved) => {
        if (!saved) return
        if (submit) {
          const result = await api_submit_case(props.id)
          if (result.code != 0) {
            setError(result.message)
            return
          }
          alert('Pismo zostało złożone w dziekanacie.')
        } else {
          alert(t('Success! Your query has succesfully sent.'))
        }
        dispatch(fetchList())
        dispatch(setEdForm(false))
      })
      .catch(err => {
        console.log('Operation failed!! ' + JSON.stringify(err));
        setError(t('Operation failed!'))
      })
      .finally(() => dispatch(progressBarReset(1)))
  }

  return (
    <div className="space-y-4">
      {!editable && (
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-2">
          <div>
            <b>Status:</b> {CASE_STATUS_LABELS[status] || status}
          </div>
          {status === 'In Progress' && (
            <div className="text-amber-800">
              Dziekanat prosi o uzupełnienie - wykonaj zadanie „Uzupełnienie” w Zadaniach.
            </div>
          )}
          {props.meta?.response && (
            <div>
              <b>Odpowiedź dziekanatu</b>
              {props.meta.response_date && <span className="text-slate-500"> ({props.meta.response_date.slice(0, 16)})</span>}
              <div className="mt-1 whitespace-pre-wrap">{props.meta.response}</div>
            </div>
          )}
        </div>
      )}

      <SchemaForm
        schema={props.schema}
        uiSchema={props.uiSchema}
        formData={data}
        disabled={!editable}
        error={error}
        onChange={setData}
        onSubmit={() => run(false)}
      />

      {editable && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => run(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Icon icon="mdi:content-save" className="w-4 h-4" />
            Zapisz szkic
          </button>
          <button
            type="button"
            onClick={() => run(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Icon icon="mdi:send" className="w-4 h-4" />
            Złóż pismo
          </button>
        </div>
      )}
    </div>
  )
}

export default FormUpdate
