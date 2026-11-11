import { useTranslation } from "react-i18next";
import Head from 'next/head';
import { Icon } from '@iconify/react';

import { useAuth, LoginPage } from "@galicea-lab/nextjs-keycloak-auth";
import CONFIG from '@/configs/config';

import JFormList from './list'
import FormDocAdd from '@/pages/docs/add'

const WizardDocAdd = () => {
  const { t } = useTranslation();
  const auth = useAuth()

  if (!auth.user?.username) {
    // bez keycloakConfig LoginPage używa domyślnej konfiguracji
    // biblioteki (realms/lab, klient lab) zamiast realmu aplikacji.
    return <LoginPage keycloakConfig={{ keycloak: CONFIG.keycloak, keycloak_client: CONFIG.keycloak_client }} />
  }

  return (
    <>
      <Head>
        <title>Korespondencja z dziekanatem | Galwork Edu</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t("Correspondence with the Dean's Office")}
          </h1>
        </div>

        {/* 2026-11-06: pisma z procesem (np. edu-pismo) są rozpatrywane
            elektronicznie - zastąpiono komunikat o drukowaniu i składaniu
            dokumentów w formie papierowej. */}
        <div className="flex items-start gap-2 p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-900 text-xs">
          <Icon icon="mdi:information-outline" className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            Wybierz rodzaj sprawy, wypełnij formularz i naciśnij <b>„Złóż pismo”</b>.
            Pismo trafi do dziekanatu elektronicznie, a odpowiedź zobaczysz na liście spraw.
            Jeśli dziekanat poprosi o uzupełnienie, znajdziesz je w <b>Zadaniach</b>.<br />
            Szkic możesz zapisywać i poprawiać do chwili złożenia. Załączniki dodasz ikoną spinacza.
          </div>
        </div>

        <FormDocAdd />
        <JFormList />
      </div>
    </>
  )
}

export default WizardDocAdd
