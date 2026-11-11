// nowe hasło kandydata - kod jednorazowy na zweryfikowany
// telefon albo e-mail konta (usługa kont huba). Odpowiedź jest taka sama,
// gdy konta nie ma.
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { KontoKonfiguracja, Przepustka, kontoApi } from '@/api/rekrutacja';
import { LoadingSpinner } from '@/components/common';
import { Alert, Button, Captcha, Card, Field, ZalogujKandydata, apiError, rekrutacjaLayout } from '@/components/rekrutacja';

const NoweHaslo = () => {
  const [config, setConfig] = useState<KontoKonfiguracja | null>(null);
  const [login, setLogin] = useState('');
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [ticket, setTicket] = useState<Przepustka | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    kontoApi.konfiguracja().then(setConfig).catch((e) => setError(apiError(e)));
  }, []);

  const wyslijKod = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setTicket(await kontoApi.kodResetu(login, captcha));
    } catch (err) {
      setError(apiError(err));
      setCaptchaReset((n) => n + 1);
    } finally {
      setBusy(false);
    }
  };

  const ustaw = async (e: FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    if (password !== password2) {
      setError('Hasła nie są takie same.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await kontoApi.reset(ticket.ticket, code.trim(), password);
      setDone(true);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  if (!config && !error) return <LoadingSpinner message="Ładowanie..." />;

  if (done) {
    return (
      <Card title="Hasło zmienione">
        <Alert kind="success">Zaloguj się nowym hasłem. Wszystkie wcześniejsze sesje zostały zakończone.</Alert>
        <div className="mt-4">
          <ZalogujKandydata />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && <Alert kind="error">{error}</Alert>}
      {ticket && !error && <Alert kind="info">{ticket.message}</Alert>}

      {!ticket && config && (
        <Card title="Nie pamiętam hasła">
          <form onSubmit={wyslijKod} className="space-y-4">
            <Field label="Login albo adres e-mail" required autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} />
            <Captcha siteKey={config.captcha_site_key} onToken={setCaptcha} resetKey={captchaReset} />
            <Button type="submit" disabled={busy || (!!config.captcha_site_key && !captcha)}>
              <Icon icon="mdi:send-outline" fontSize={18} />
              Wyślij kod
            </Button>
          </form>
        </Card>
      )}

      {ticket && (
        <Card title="Ustaw nowe hasło">
          <form onSubmit={ustaw} className="space-y-4">
            <Field label="Kod jednorazowy" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nowe hasło" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} hint="Co najmniej 10 znaków" />
              <Field label="Powtórz hasło" type="password" required autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
            </div>
            <Button type="submit" disabled={busy}>Ustaw hasło</Button>
          </form>
        </Card>
      )}

      <p className="text-sm">
        <Link href="/rekrutacja" className="text-blue-700 hover:underline">
          Wróć
        </Link>
      </p>
    </div>
  );
};

NoweHaslo.getLayout = rekrutacjaLayout;

export default NoweHaslo;
