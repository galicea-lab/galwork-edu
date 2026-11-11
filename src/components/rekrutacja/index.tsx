// wspólne elementy stron rekrutacji: pola formularza, komunikaty i hCaptcha.
import React, { ReactNode, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { LoginButton, useAuth } from '@galicea-lab/nextjs-keycloak-auth';
import CONFIG from '@/configs/config';
import { setAuthToken } from '@/api/client';

/** Strona, na którą kandydat wraca po zalogowaniu (domyślnie). */
export const STRONA_KANDYDATA = '/rekrutacja';

const MENU: Array<{ href: string; label: string; icon: string }> = [
  { href: '/rekrutacja', label: 'Start', icon: 'mdi:home-outline' },
  { href: '/rekrutacja/dane', label: 'Dane osobowe', icon: 'mdi:account-edit-outline' },
  { href: '/rekrutacja/kierunki', label: 'Wybór kierunku', icon: 'mdi:school-outline' },
  { href: '/rekrutacja/przebieg', label: 'Przebieg rekrutacji', icon: 'mdi:timeline-check-outline' },
];

/** Przycisk logowania realmu kandydatów; po zalogowaniu powrót na `returnPath`. */
export const ZalogujKandydata = ({ returnPath = STRONA_KANDYDATA }: { returnPath?: string }) => (
  <LoginButton
    page="login"
    returnPath={returnPath}
    keycloakConfig={{ keycloak: CONFIG.keycloak, keycloak_client: CONFIG.keycloak_client }}
  />
);

const MenuKandydata = () => {
  const { pathname } = useRouter();
  const sciezka = pathname.replace(/\/+$/, '') || '/';
  return (
    <nav className="border-t border-slate-100">
      <div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4">
        {MENU.map((pozycja) => {
          const aktywna = sciezka === pozycja.href;
          return (
            <Link
              key={pozycja.href}
              href={pozycja.href}
              aria-current={aktywna ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-2 py-2 text-sm ${
                aktywna ? 'border-blue-600 font-medium text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon icon={pozycja.icon} fontSize={16} />
              {pozycja.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export const RekrutacjaLayout = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  // token dla klienta /v1/rekrutacja - synchronizacja w renderze (jak w TailwindLayout)
  const lastToken = useRef<string | null>(null);
  const token = auth?.authToken?.access_token ?? null;
  if (lastToken.current !== token) {
    lastToken.current = token;
    setAuthToken(token);
  }
  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>Rekrutacja na studia</title>
      </Head>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/rekrutacja" className="flex items-center gap-2 font-semibold text-slate-900">
            <Icon icon="mdi:school-outline" fontSize={22} className="text-blue-600" />
            Rekrutacja na studia
          </Link>
          {auth?.user?.username && (
            <span className="text-xs text-slate-500">{auth.user.email || auth.user.username}</span>
          )}
        </div>
        {auth?.user?.username && <MenuKandydata />}
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
};

export const rekrutacjaLayout = (page: React.ReactElement) => <RekrutacjaLayout>{page}</RekrutacjaLayout>;

export const Card = ({ title, children }: { title?: string; children: ReactNode }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    {title && <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>}
    {children}
  </section>
);

export const Alert = ({ kind, children }: { kind: 'error' | 'info' | 'success'; children: ReactNode }) => {
  const styles = {
    error: 'border-rose-200 bg-rose-50 text-rose-800',
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  }[kind];
  return <div className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>{children}</div>;
};

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export const Field = ({ label, hint, ...input }: FieldProps) => (
  <label className="block text-sm">
    <span className="mb-1 block font-medium text-slate-700">{label}</span>
    <input
      {...input}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
    />
    {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
  </label>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

export const Select = ({ label, options, ...select }: SelectProps) => (
  <label className="block text-sm">
    <span className="mb-1 block font-medium text-slate-700">{label}</span>
    <select
      {...select}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <option value="">—</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

export const Button = ({
  children,
  variant = 'primary',
  ...button
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }) => (
  <button
    {...button}
    className={
      variant === 'primary'
        ? 'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50'
        : 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50'
    }
  >
    {children}
  </button>
);

declare global {
  interface Window {
    hcaptcha?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

const HCAPTCHA_SRC = 'https://js.hcaptcha.com/1/api.js?render=explicit';

/** hCaptcha; bez klucza witryny (usługa kont bez CAPTCHA - tylko dev) nic nie wyświetla. */
export const Captcha = ({
  siteKey,
  onToken,
  resetKey,
}: {
  siteKey: string | null;
  onToken: (token: string | null) => void;
  resetKey?: number;
}) => {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey) return;
    const render = () => {
      if (!container.current || !window.hcaptcha || widget.current !== null) return;
      widget.current = window.hcaptcha.render(container.current, {
        sitekey: siteKey,
        hl: 'pl',
        callback: (token: string) => onToken(token),
        'expired-callback': () => onToken(null),
      });
    };
    if (window.hcaptcha) {
      render();
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(`script[src="${HCAPTCHA_SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = HCAPTCHA_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', render);
    return () => script?.removeEventListener('load', render);
  }, [siteKey, onToken]);

  useEffect(() => {
    if (resetKey && window.hcaptcha && widget.current !== null) {
      window.hcaptcha.reset(widget.current);
      onToken(null);
    }
  }, [resetKey, onToken]);

  if (!siteKey) return null;
  return <div ref={container} />;
};

export const apiError = (error: unknown): string => {
  const data = (error as { response?: { data?: { detail?: unknown } } })?.response?.data;
  if (typeof data?.detail === 'string') return data.detail;
  if (Array.isArray(data?.detail)) {
    return data.detail.map((d: { msg?: string }) => d.msg || '').filter(Boolean).join(', ');
  }
  return 'Wystąpił błąd. Spróbuj ponownie.';
};
