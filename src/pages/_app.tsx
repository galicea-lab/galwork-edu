import Head from 'next/head';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { DictionaryProvider } from '@galicea-lab/rjsf-widgets';
import { dictionariesApi } from '@/api/dictionaries';
import CONFIG from '@/configs/config';

// Component Imports
// layout wydzielony do src/layouts (marka i menu w src/layouts/app/theme.ts i navigation.ts).
import { getAppLayout } from '@/layouts';
import { MARKA } from '@/layouts/app/theme';
import { AuthProvider } from '@galicea-lab/nextjs-keycloak-auth';

// Global css styles
import '@/styles/globals.css';

// Extend App Props
type ExtendedAppProps = AppProps & {
  Component: NextPage & {
    getLayout?: (page: React.ReactElement) => React.ReactNode;
  };
};

const App = (props: ExtendedAppProps) => {
  const { Component, pageProps } = props;

  // Variables
  const getLayout = Component.getLayout ?? getAppLayout;

  return (
    <Provider store={store}>
      <AuthProvider
        keycloakConfig={{ keycloak: CONFIG.keycloak, keycloak_client: CONFIG.keycloak_client }}
      >
        <DictionaryProvider fetchOptions={dictionariesApi.listOptions}>
          <Head>
            <title>{MARKA.nazwa}</title>
            <meta name="description" content={MARKA.opis} />
            <meta
              name="keywords"
              content="uczelnia, dziekanat, plan zajęć, oceny, legitymacja, workflow"
            />
            <meta name="viewport" content="initial-scale=1, width=device-width" />
          </Head>
          {getLayout(<Component {...pageProps} />)}
        </DictionaryProvider>
      </AuthProvider>
    </Provider>
  );
};

export default App;
