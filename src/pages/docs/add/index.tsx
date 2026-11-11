import { useEffect } from 'react'
import { Icon } from '@iconify/react'

import { fetchFormtypes, fetchList, setEdForm, setCurrentFormType, setJForm,
         progressBarUp, progressBarDown, progressBarReset } from '@/store/jform'

import { useDispatch, useSelector } from 'react-redux'

import { useTranslation } from 'react-i18next'
import { useAuth } from '@galicea-lab/nextjs-keycloak-auth'

import { RootState, AppDispatch } from '@/store'
import { api_post_new_form } from '@/api/jform'

import { Modal } from '@/components/common/Modal'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import FormUpdate from './form_update';


const JFormSprawy = () => {
  const dispatch = useDispatch<AppDispatch>()
  const store_jform = useSelector((state: RootState) => state.jform)
  const { t } = useTranslation()
  const auth = useAuth()

  const CurrentFormTypeName = () => {
    for (let ft of store_jform.formTypes) {
      if (ft.id==store_jform.currentFormType) return ft.name
    }
    return ''
  }

  const handleFormtypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setCurrentFormType(event.target.value))
  };

  useEffect(() => {
      dispatch(fetchFormtypes())
   },
   [dispatch]
   )

  const newForm = () => {
    if (! (auth && auth.user) ) {
      alert('Musisz być zalogowany!');
      return
    }
    if (!store_jform.currentFormType) {
      alert('Wybierz typ sprawy');
      return
    }
    // 2026-11-06: hub zakłada sprawę dla studenta z tokenu (e-mail);
    // parametry student/email/grupa z WEBCON nie są już potrzebne.
    dispatch(progressBarUp(1))
    api_post_new_form({ formtype: store_jform.currentFormType })
    .then(response => {
      dispatch( progressBarDown(1))
      if (response.code==0) {
        dispatch(
          setJForm({element:response.inst.id, schema:response.schema,
                    uiSchema:response.uischema, cdata:response.data})
        )
        dispatch(fetchList())
        dispatch( setEdForm(true) )
      } else {
        alert(t('Operation failed!') +': '+response.message);
      }
    })
    .catch(error => {
      dispatch( progressBarReset(1))
      console.log('Operation failed!! '+JSON.stringify(error));
      alert(t('Operation failed!'));
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      {store_jform.progressBar > 0 && <LoadingSpinner size="sm" message="" className="p-2" />}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Formularz
          </label>
          <select
            value={store_jform.currentFormType}
            onChange={handleFormtypeChange}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white sm:w-2/3"
          >
            <option value="">---</option>
            {store_jform && store_jform.formTypes && store_jform.formTypes.length > 0
              ? store_jform.formTypes.map((pform) => (
                  <option value={pform.id} key={pform.id}>{pform.name}</option>
                ))
              : null}
          </select>
          <p className="text-xs text-slate-500 mt-1">
            Wybierz formularz i naciśnij "Nowy dokument"<br />
            {auth.user?.email}
          </p>
        </div>

        <button
          type="button"
          onClick={newForm}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
        >
          <Icon icon="mdi:file-plus" className="w-4 h-4" />
          {t('Create New')}
        </button>
      </div>

      <Modal
        isOpen={store_jform.edForm || false}
        onClose={() => dispatch(setEdForm(false))}
        title={CurrentFormTypeName()}
        maxWidth="xl"
        footer={
          <button
            type="button"
            onClick={() => dispatch(setEdForm(false))}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {t('Close')}
          </button>
        }
      >
        <FormUpdate id={store_jform.jform?.element || ''}
                   schema={store_jform.jform?.schema}
                   uiSchema={store_jform.jform?.uiSchema}
                   cdata={store_jform.jform?.cdata}
                   meta={store_jform.jform?.meta}
                   key={store_jform.jform?.element || 'new'} />
      </Modal>
    </div>
  )
}


export default JFormSprawy
