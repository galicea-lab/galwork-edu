// pages/login/index.tsx

import { LoginPage, KeycloakConfig } from '@galicea-lab/nextjs-keycloak-auth';
import CONFIG from '@/configs/config';

// 2026-11-06: realm i klient z configs/config.ts (wspólne z AuthProvider
// w _app.tsx), zamiast kopii wpisanej na stałe w tej stronie.
const keycloakConfig_my: KeycloakConfig = {
  keycloak: CONFIG.keycloak,
  keycloak_client: CONFIG.keycloak_client,
};


const Login = () => {
  return <LoginPage keycloakConfig = { keycloakConfig_my} />;

}

export default Login
