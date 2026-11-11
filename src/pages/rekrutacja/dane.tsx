// formularz danych osobowych kandydata. Dane idą przez hub
// (/v1/rekrutacja/profil) do Frappe (admissions_poland), które je waliduje
// (PESEL i data urodzenia, dokument tożsamości dla osób bez PESEL-u).
import { FormEvent, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useAuth } from '@galicea-lab/nextjs-keycloak-auth';
import { Profil, Slowniki, rekrutacjaApi } from '@/api/rekrutacja';
import { LoadingSpinner } from '@/components/common';
import { Alert, Button, Card, Field, Select, ZalogujKandydata, apiError, rekrutacjaLayout } from '@/components/rekrutacja';

type Dane = Omit<Profil, 'name' | 'email'>;

const doFormularza = (profil: Profil): Dane => {
  const dane: Partial<Profil> = { ...profil };
  delete dane.name;
  delete dane.email;
  return dane;
};

const TEKSTOWE: Array<[keyof Dane, string, string?]> = [
  ['first_name', 'Imię', 'given-name'],
  ['second_name', 'Drugie imię', 'additional-name'],
  ['last_name', 'Nazwisko', 'family-name'],
  ['family_name', 'Nazwisko rodowe'],
  ['fathers_name', 'Imię ojca'],
  ['mothers_name', 'Imię matki'],
];

const ADRES: Array<[keyof Dane, string, string?]> = [
  ['street', 'Ulica', 'address-line1'],
  ['building_number', 'Nr domu'],
  ['flat_number', 'Nr lokalu'],
  ['postal_code', 'Kod pocztowy', 'postal-code'],
  ['city', 'Miejscowość', 'address-level2'],
];

const DOKUMENTY: Record<string, string> = {
  'ID Card': 'Dowód osobisty',
  Passport: 'Paszport',
  'Residence Card': 'Karta pobytu',
  Other: 'Inny',
};

const DaneOsobowe = () => {
  const auth = useAuth();
  const [profil, setProfil] = useState<Profil | null>(null);
  const [dane, setDane] = useState<Dane>({});
  const [slowniki, setSlowniki] = useState<Slowniki | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!auth?.user?.username || auth.loading) return;
    Promise.all([rekrutacjaApi.profil(), rekrutacjaApi.slowniki()])
      .then(([p, s]) => {
        setProfil(p);
        setDane(doFormularza(p));
        setSlowniki(s);
      })
      .catch((e) => setError(apiError(e)));
  }, [auth?.user?.username, auth?.loading]);

  if (auth?.loading) return <LoadingSpinner message="Ładowanie..." />;

  if (!auth?.user?.username) {
    return (
      <Card title="Zaloguj się">
        <p className="mb-4 text-sm text-slate-600">Aby uzupełnić dane osobowe, zaloguj się na swoje konto kandydata.</p>
        <ZalogujKandydata returnPath="/rekrutacja/dane" />
      </Card>
    );
  }

  const text = (key: keyof Dane) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSaved(false);
    setDane({ ...dane, [key]: e.target.value });
  };

  const zapisz = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      setDane(doFormularza(await rekrutacjaApi.zapiszProfil(dane)));
      setSaved(true);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  if (!profil && !error) return <LoadingSpinner message="Ładowanie danych..." />;

  return (
    <form onSubmit={zapisz} className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dane osobowe</h1>
        {profil && <p className="mt-1 text-xs text-slate-500">Konto: {profil.email}</p>}
      </div>
      {error && <Alert kind="error">{error}</Alert>}
      {saved && <Alert kind="success">Dane zapisane.</Alert>}

      <Card title="Osoba">
        <div className="grid gap-4 sm:grid-cols-2">
          {TEKSTOWE.map(([key, label, autoComplete]) => (
            <Field key={key} label={label} autoComplete={autoComplete} required={key === 'first_name' || key === 'last_name'} value={(dane[key] as string) || ''} onChange={text(key)} />
          ))}
          <Field label="Data urodzenia" type="date" autoComplete="bday" value={dane.date_of_birth || ''} onChange={text('date_of_birth')} />
          <Field label="Miejsce urodzenia" value={dane.place_of_birth || ''} onChange={text('place_of_birth')} />
          <Select label="Płeć" options={slowniki?.genders || []} value={dane.gender || ''} onChange={text('gender')} />
          <Select label="Obywatelstwo" options={slowniki?.countries || []} value={dane.citizenship || ''} onChange={text('citizenship')} />
        </div>
      </Card>

      <Card title="Tożsamość">
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!dane.no_pesel}
            onChange={(e) => {
              setSaved(false);
              setDane({ ...dane, no_pesel: e.target.checked });
            }}
          />
          Nie mam numeru PESEL
        </label>
        {!dane.no_pesel ? (
          <Field label="PESEL" inputMode="numeric" maxLength={11} required value={dane.pesel || ''} onChange={text('pesel')} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">Dokument tożsamości</span>
              <select
                required
                value={dane.identity_document_type || ''}
                onChange={text('identity_document_type')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {(slowniki?.identity_document_types || []).map((d) => (
                  <option key={d} value={d}>
                    {DOKUMENTY[d] || d}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Numer dokumentu" required value={dane.identity_document_number || ''} onChange={text('identity_document_number')} />
          </div>
        )}
      </Card>

      <Card title="Kontakt i adres">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefon" type="tel" autoComplete="tel" value={dane.phone || ''} onChange={text('phone')} />
          {ADRES.map(([key, label, autoComplete]) => (
            <Field key={key} label={label} autoComplete={autoComplete} value={(dane[key] as string) || ''} onChange={text(key)} />
          ))}
          <Select label="Kraj" options={slowniki?.countries || []} value={dane.country || ''} onChange={text('country')} />
        </div>
      </Card>

      <Button type="submit" disabled={busy}>
        <Icon icon="mdi:content-save-outline" fontSize={18} />
        Zapisz dane
      </Button>
    </form>
  );
};

DaneOsobowe.getLayout = rekrutacjaLayout;

export default DaneOsobowe;
