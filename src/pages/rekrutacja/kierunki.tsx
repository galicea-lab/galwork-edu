// wybór kierunku - publiczny katalog (/v1/rekrutacja/kierunki) i
// zgłoszenie zalogowanego kandydata (POST /v1/rekrutacja/zgloszenia). Frappe
// sprawdza, czy rejestracja jest otwarta i czy dane osobowe są kompletne;
// priorytet zgłoszenia nadaje kolejny wolny.
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useAuth } from '@galicea-lab/nextjs-keycloak-auth';
import { KampaniaHarmonogram, Kierunek, Zgloszenie, rekrutacjaApi } from '@/api/rekrutacja';
import { Badge, ConfirmDialog, EmptyState, LoadingSpinner } from '@/components/common';
import { Alert, Button, Card, ZalogujKandydata, apiError, rekrutacjaLayout } from '@/components/rekrutacja';
import { okres } from '@/components/rekrutacja/statusy';

const PLN = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' });

const WyborKierunku = () => {
  const auth = useAuth();
  const zalogowany = Boolean(auth?.user?.username);
  const [kierunki, setKierunki] = useState<Kierunek[] | null>(null);
  const [kampanie, setKampanie] = useState<KampaniaHarmonogram[]>([]);
  const [zgloszenia, setZgloszenia] = useState<Zgloszenie[]>([]);
  const [wybrany, setWybrany] = useState<Kierunek | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sukces, setSukces] = useState<Zgloszenie | null>(null);

  useEffect(() => {
    // harmonogram tylko uzupełnia katalog (terminy) - jego brak nie blokuje wyboru
    Promise.all([rekrutacjaApi.kierunki(), rekrutacjaApi.harmonogram().catch(() => [])])
      .then(([k, h]) => {
        setKierunki(k);
        setKampanie(h);
      })
      .catch((e) => {
        setKierunki([]);
        setError(apiError(e));
      });
  }, []);

  const wczytajZgloszenia = useCallback(() => {
    rekrutacjaApi
      .zgloszenia()
      .then(setZgloszenia)
      .catch((e) => setError(apiError(e)));
  }, []);

  useEffect(() => {
    if (zalogowany && !auth.loading) wczytajZgloszenia();
  }, [zalogowany, auth?.loading, wczytajZgloszenia]);

  // aktywne zgłoszenie na kierunek (wycofane można złożyć ponownie)
  const aktywne = useMemo(() => {
    const mapa = new Map<string, Zgloszenie>();
    zgloszenia.filter((z) => z.submission_status !== 'Withdrawn').forEach((z) => mapa.set(z.admission_programme, z));
    return mapa;
  }, [zgloszenia]);

  // jak we Frappe: kolejny po najwyższym priorytecie aktywnych zgłoszeń kampanii
  const nastepnyPriorytet = (kierunek: Kierunek | null) =>
    Math.max(0, ...Array.from(aktywne.values()).filter((z) => z.campaign === kierunek?.campaign).map((z) => z.priority)) + 1;

  const grupy = useMemo(() => {
    const wedlugKampanii = new Map<string, Kierunek[]>();
    (kierunki ?? []).forEach((k) => wedlugKampanii.set(k.campaign, [...(wedlugKampanii.get(k.campaign) ?? []), k]));
    return Array.from(wedlugKampanii.entries()).map(([kampania, lista]) => ({
      kampania,
      opis: kampanie.find((c) => c.name === kampania),
      lista,
    }));
  }, [kierunki, kampanie]);

  const zglos = async () => {
    if (!wybrany) return;
    setBusy(true);
    setError(null);
    setSukces(null);
    try {
      setSukces(await rekrutacjaApi.zglos(wybrany.name));
      wczytajZgloszenia();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
      setWybrany(null);
    }
  };

  if (kierunki === null) return <LoadingSpinner message="Ładowanie kierunków..." />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Wybór kierunku</h1>
        <p className="mt-1 text-sm text-slate-600">
          Możesz zgłosić się na kilka kierunków. Kolejność zgłoszeń to Twoje priorytety (1 - najważniejszy).
        </p>
      </div>

      {error && (
        <Alert kind="error">
          {error}
          {/dane osobowe/i.test(error) && (
            <>
              {' '}
              <Link href="/rekrutacja/dane" className="font-medium underline">
                Przejdź do danych osobowych
              </Link>
            </>
          )}
        </Alert>
      )}
      {sukces && (
        <Alert kind="success">
          Zgłoszenie na kierunek <strong>{sukces.programme_title || sukces.admission_programme}</strong> zostało
          złożone (priorytet {sukces.priority}).{' '}
          <Link href="/rekrutacja/przebieg" className="font-medium underline">
            Zobacz przebieg rekrutacji
          </Link>
        </Alert>
      )}

      {!zalogowany && !auth?.loading && (
        <Card title="Zaloguj się, aby wybrać kierunek">
          <p className="mb-4 text-sm text-slate-600">Katalog kierunków jest publiczny, a zgłoszenie wymaga konta kandydata.</p>
          <ZalogujKandydata returnPath="/rekrutacja/kierunki" />
        </Card>
      )}

      {grupy.length === 0 && (
        <EmptyState icon="mdi:school-outline" title="Brak kierunków" description="Obecnie nie trwa żadna rekrutacja." />
      )}

      {grupy.map(({ kampania, opis, lista }) => (
        <Card key={kampania} title={opis?.title || kampania}>
          {opis && (
            <p className="mb-4 flex items-center gap-1.5 text-sm text-slate-600">
              <Icon icon="mdi:calendar-range" fontSize={16} />
              Rejestracja: {okres(opis.application_start, opis.application_end)}
            </p>
          )}
          <ul className="divide-y divide-slate-100">
            {lista.map((k) => {
              const zgloszenie = aktywne.get(k.name);
              return (
                <li key={k.name} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{k.title || k.program}</p>
                    <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
                      <span>{k.code}</span>
                      {!!k.admission_limit && <span>Limit miejsc: {k.admission_limit}</span>}
                      <span>Opłata: {k.application_fee ? PLN.format(k.application_fee) : 'brak'}</span>
                    </p>
                  </div>
                  {zgloszenie ? (
                    <Badge variant="success" icon={<Icon icon="mdi:check" fontSize={14} />}>
                      Wybrany - priorytet {zgloszenie.priority}
                    </Badge>
                  ) : k.status !== 'Open' ? (
                    <Badge variant="default">Rejestracja zamknięta</Badge>
                  ) : zalogowany ? (
                    <Button onClick={() => setWybrany(k)} disabled={busy}>
                      <Icon icon="mdi:plus" fontSize={18} />
                      Wybieram
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Card>
      ))}

      <ConfirmDialog
        isOpen={wybrany !== null}
        onClose={() => setWybrany(null)}
        onConfirm={zglos}
        loading={busy}
        variant="primary"
        title="Zgłoszenie na kierunek"
        message={`Czy złożyć zgłoszenie na kierunek „${wybrany?.title || wybrany?.program || ''}”? Otrzyma ono priorytet ${nastepnyPriorytet(
          wybrany
        )}.`}
        confirmText="Składam zgłoszenie"
        cancelText="Anuluj"
      />
    </div>
  );
};

WyborKierunku.getLayout = rekrutacjaLayout;

export default WyborKierunku;
