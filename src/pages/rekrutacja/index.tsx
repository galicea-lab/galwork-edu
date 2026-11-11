// strona startowa rekrutacji - bez logowania: logowanie (Keycloak, realm
// kandydatów), założenie konta i odzyskanie hasła (usługa kont huba);
// po zalogowaniu: panel kandydata (dane, wybór kierunku, przebieg).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useAuth } from '@galicea-lab/nextjs-keycloak-auth';
import { Zgloszenie, rekrutacjaApi } from '@/api/rekrutacja';
import { Card, ZalogujKandydata, rekrutacjaLayout } from '@/components/rekrutacja';

const KROKI = [
  {
    href: '/rekrutacja/dane',
    icon: 'mdi:account-edit-outline',
    tytul: 'Dane osobowe',
    opis: 'Uzupełnij dane potrzebne do zgłoszenia.',
  },
  {
    href: '/rekrutacja/kierunki',
    icon: 'mdi:school-outline',
    tytul: 'Wybór kierunku',
    opis: 'Zgłoś się na jeden lub kilka kierunków.',
  },
  {
    href: '/rekrutacja/przebieg',
    icon: 'mdi:timeline-check-outline',
    tytul: 'Przebieg rekrutacji',
    opis: 'Opłaty, dokumenty, wyniki kwalifikacji i decyzje.',
  },
];

const PanelKandydata = () => {
  const [zgloszenia, setZgloszenia] = useState<Zgloszenie[] | null>(null);

  useEffect(() => {
    rekrutacjaApi
      .zgloszenia()
      .then(setZgloszenia)
      .catch(() => setZgloszenia(null));
  }, []);

  const aktywne = (zgloszenia ?? []).filter((z) => z.submission_status !== 'Withdrawn').length;

  return (
    <div className="space-y-4">
      <Card title="Witaj w systemie rekrutacji">
        <p className="text-sm text-slate-600">
          {zgloszenia === null
            ? 'Uzupełnij dane osobowe, wybierz kierunek i śledź przebieg rekrutacji.'
            : aktywne
              ? `Masz ${aktywne} ${aktywne === 1 ? 'aktywne zgłoszenie' : aktywne < 5 ? 'aktywne zgłoszenia' : 'aktywnych zgłoszeń'}.`
              : 'Nie masz jeszcze zgłoszeń - uzupełnij dane osobowe i wybierz kierunek.'}
        </p>
      </Card>
      <div className="grid gap-3 sm:grid-cols-3">
        {KROKI.map((krok, i) => (
          <Link
            key={krok.href}
            href={krok.href}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow"
          >
            <span className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              Krok {i + 1}
            </span>
            <span className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-blue-700">
              <Icon icon={krok.icon} fontSize={20} />
              {krok.tytul}
            </span>
            <span className="mt-1 block text-sm text-slate-600">{krok.opis}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const RekrutacjaStart = () => {
  const auth = useAuth();

  if (auth?.user?.username) return <PanelKandydata />;

  return (
    <div className="space-y-4">
      <Card title="Masz już konto?">
        <ZalogujKandydata />
        <p className="mt-3 text-sm">
          <Link href="/rekrutacja/haslo" className="text-blue-700 hover:underline">
            Nie pamiętam hasła
          </Link>
        </p>
      </Card>
      <Card title="Pierwszy raz w rekrutacji?">
        <p className="mb-4 text-sm text-slate-600">
          Załóż konto. Potwierdzimy Twój numer telefonu albo adres e-mail kodem jednorazowym.
        </p>
        <Link href="/rekrutacja/rejestracja" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Icon icon="mdi:account-plus-outline" fontSize={18} />
          Załóż konto
        </Link>
      </Card>
      <p className="text-center text-sm">
        <Link href="/rekrutacja/kierunki" className="text-blue-700 hover:underline">
          Zobacz kierunki i terminy rekrutacji
        </Link>
      </p>
    </div>
  );
};

RekrutacjaStart.getLayout = rekrutacjaLayout;

export default RekrutacjaStart;
