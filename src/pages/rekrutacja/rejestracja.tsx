// założenie konta kandydata - kod jednorazowy (SMS albo e-mail) potwierdza kanał, potem konto w Keycloak. 
// Kodem jednorazowym nie można się logować, tylko założyć konto i ustawić hasło.
// Potem normalne logowanie.
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Kanal, KontoKonfiguracja, Przepustka, kontoApi } from '@/api/rekrutacja';
import { LoadingSpinner } from '@/components/common';
import { Alert, Button, Captcha, Card, Field, ZalogujKandydata, apiError, rekrutacjaLayout } from '@/components/rekrutacja';

const KANALY: Record<Kanal, string> = { sms: 'SMS na telefon', email: 'e-mail' };

const Rejestracja = () => {
  const [config, setConfig] = useState<KontoKonfiguracja | null>(null);
  const [channel, setChannel] = useState<Kanal>('sms');
  const [destination, setDestination] = useState('');
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [ticket, setTicket] = useState<Przepustka | null>(null);
  const [form, setForm] = useState({ code: '', email: '', first_name: '', last_name: '', pesel: '', password: '', password2: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    kontoApi
      .konfiguracja()
      .then((c) => {
        setConfig(c);
        if (c.channels.length) setChannel(c.channels[0]);
      })
      .catch((e) => setError(apiError(e)));
  }, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const wyslijKod = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const t = await kontoApi.kodRejestracji(channel, destination, captcha);
      setTicket(t);
      setInfo(t.message);
      if (channel === 'email') setForm((f) => ({ ...f, email: destination }));
    } catch (err) {
      setError(apiError(err));
      setCaptchaReset((n) => n + 1);
    } finally {
      setBusy(false);
    }
  };

  const ponow = async () => {
    if (!ticket) return;
    setBusy(true);
    setError(null);
    try {
      const t = await kontoApi.ponow(ticket.ticket, destination);
      setTicket(t);
      setInfo('Wysłaliśmy nowy kod.');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const zaloz = async (e: FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    if (form.password !== form.password2) {
      setError('Hasła nie są takie same.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await kontoApi.rejestracja({
        ticket: ticket.ticket,
        code: form.code.trim(),
        email: form.email,
        phone: channel === 'sms' ? destination : null,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
        pesel: config?.pesel !== 'off' && form.pesel ? form.pesel : null,
      });
      setDone(result.username);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  if (!config && !error) return <LoadingSpinner message="Ładowanie..." />;

  if (done) {
    return (
      <Card title="Konto założone">
        <Alert kind="success">
          Twoje konto jest gotowe. Login: <strong>{done}</strong>
        </Alert>
        <div className="mt-4">
          <ZalogujKandydata />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && <Alert kind="error">{error}</Alert>}
      {info && !error && <Alert kind="info">{info}</Alert>}

      {!ticket && config && (
        <Card title="Załóż konto - krok 1 z 2">
          <form onSubmit={wyslijKod} className="space-y-4">
            {config.channels.length > 1 && (
              <div className="flex gap-4 text-sm">
                {config.channels.map((c) => (
                  <label key={c} className="flex items-center gap-2">
                    <input type="radio" name="channel" checked={channel === c} onChange={() => setChannel(c)} />
                    Kod przez {KANALY[c]}
                  </label>
                ))}
              </div>
            )}
            {channel === 'sms' ? (
              <Field
                label="Numer telefonu komórkowego"
                type="tel"
                autoComplete="tel"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                hint={`Obsługiwane numery kierunkowe: ${config.sms_country_codes.map((c) => '+' + c).join(', ')}`}
              />
            ) : (
              <Field label="Adres e-mail" type="email" autoComplete="email" required value={destination} onChange={(e) => setDestination(e.target.value)} />
            )}
            <Captcha siteKey={config.captcha_site_key} onToken={setCaptcha} resetKey={captchaReset} />
            <Button type="submit" disabled={busy || (!!config.captcha_site_key && !captcha)}>
              <Icon icon="mdi:send-outline" fontSize={18} />
              Wyślij kod
            </Button>
          </form>
        </Card>
      )}

      {ticket && config && (
        <Card title="Załóż konto - krok 2 z 2">
          <form onSubmit={zaloz} className="space-y-4">
            <Field label="Kod jednorazowy" inputMode="numeric" autoComplete="one-time-code" required value={form.code} onChange={set('code')} hint={`Wysłany na: ${destination}`} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Imię" required autoComplete="given-name" value={form.first_name} onChange={set('first_name')} />
              <Field label="Nazwisko" required autoComplete="family-name" value={form.last_name} onChange={set('last_name')} />
            </div>
            <Field
              label="Adres e-mail (login)"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              disabled={channel === 'email'}
              onChange={set('email')}
            />
            {config.pesel !== 'off' && (
              <Field label={config.pesel === 'required' ? 'PESEL' : 'PESEL (jeśli masz)'} inputMode="numeric" required={config.pesel === 'required'} value={form.pesel} onChange={set('pesel')} />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hasło" type="password" required autoComplete="new-password" value={form.password} onChange={set('password')} hint="Co najmniej 10 znaków" />
              <Field label="Powtórz hasło" type="password" required autoComplete="new-password" value={form.password2} onChange={set('password2')} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy}>
                <Icon icon="mdi:account-check-outline" fontSize={18} />
                Załóż konto
              </Button>
              <Button type="button" variant="secondary" disabled={busy} onClick={ponow}>
                Wyślij kod ponownie
              </Button>
            </div>
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

Rejestracja.getLayout = rekrutacjaLayout;

export default Rejestracja;
