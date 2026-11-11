// przebieg rekrutacji kandydata - zgłoszenia z etapami (opłata, dokumenty,
// kwalifikacja, przyjęcie), decyzje i harmonogram kampanii. Dane z huba
// (/v1/rekrutacja/zgloszenia, /decyzje, /harmonogram), źródło - Frappe.
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useAuth } from '@galicea-lab/nextjs-keycloak-auth';
import { Decyzja, KampaniaHarmonogram, Zgloszenie, rekrutacjaApi } from '@/api/rekrutacja';
import { Badge, ConfirmDialog, LoadingSpinner } from '@/components/common';
import { Alert, Button, Card, ZalogujKandydata, apiError, rekrutacjaLayout } from '@/components/rekrutacja';
import { DECYZJA, DOKUMENT, Etap, etapyZgloszenia, formatData, moznaWycofac, okres } from '@/components/rekrutacja/statusy';

const IKONA_ETAPU: Record<Etap['stan'], { icon: string; className: string }> = {
  gotowe: { icon: 'mdi:check-circle', className: 'text-emerald-600' },
  biezace: { icon: 'mdi:progress-clock', className: 'text-blue-600' },
  oczekuje: { icon: 'mdi:circle-outline', className: 'text-slate-300' },
  negatywne: { icon: 'mdi:close-circle', className: 'text-rose-600' },
};

const Etapy = ({ zgloszenie }: { zgloszenie: Zgloszenie }) => (
  <ol className="space-y-2">
    {etapyZgloszenia(zgloszenie).map((etap) => (
      <li key={etap.nazwa} className="flex items-start gap-2 text-sm">
        <Icon icon={IKONA_ETAPU[etap.stan].icon} fontSize={20} className={`mt-px shrink-0 ${IKONA_ETAPU[etap.stan].className}`} />
        <span>
          <span className={etap.stan === 'oczekuje' ? 'text-slate-500' : 'font-medium text-slate-900'}>{etap.nazwa}</span>
          <span className="block text-xs text-slate-500">{etap.opis}</span>
        </span>
      </li>
    ))}
  </ol>
);

const KartaZgloszenia = ({ zgloszenie, onWycofaj }: { zgloszenie: Zgloszenie; onWycofaj: (z: Zgloszenie) => void }) => {
  const dokumenty = zgloszenie.documents ?? [];
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">{zgloszenie.programme_title || zgloszenie.admission_programme}</h3>
          <p className="text-xs text-slate-500">
            Zgłoszenie {zgloszenie.name} · priorytet {zgloszenie.priority} · tura {zgloszenie.round_number}
          </p>
        </div>
        {!!zgloszenie.rank_position && (
          <Badge variant="info">
            Miejsce na liście: {zgloszenie.rank_position}
            {zgloszenie.score ? ` (${zgloszenie.score} pkt)` : ''}
          </Badge>
        )}
      </div>
      <Etapy zgloszenie={zgloszenie} />
      {dokumenty.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Dokumenty</p>
          <ul className="space-y-1">
            {dokumenty.map((d) => (
              <li key={d.document} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-700">{d.document}</span>
                <Badge variant={DOKUMENT[d.status]?.variant ?? 'default'} size="sm">
                  {DOKUMENT[d.status]?.label ?? d.status}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
      {moznaWycofac(zgloszenie) && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <Button variant="secondary" onClick={() => onWycofaj(zgloszenie)}>
            <Icon icon="mdi:undo-variant" fontSize={18} />
            Wycofaj zgłoszenie
          </Button>
        </div>
      )}
    </section>
  );
};

const Harmonogram = ({ kampanie, kierunki }: { kampanie: KampaniaHarmonogram[]; kierunki: Set<string> }) => (
  <Card title="Harmonogram">
    {kampanie.length === 0 && <p className="text-sm text-slate-500">Harmonogram nie został jeszcze ogłoszony.</p>}
    <div className="space-y-4">
      {kampanie.map((kampania) => {
        // kierunki kandydata; bez zgłoszeń - wszystkie kierunki z turami
        const lista = kampania.programmes.filter((p) => p.rounds.length > 0 && (kierunki.size === 0 || kierunki.has(p.name)));
        return (
          <div key={kampania.name}>
            <p className="font-medium text-slate-900">{kampania.title}</p>
            <p className="text-sm text-slate-600">Rejestracja: {okres(kampania.application_start, kampania.application_end)}</p>
            {lista.map((p) => (
              <div key={p.name} className="mt-2 pl-3 text-sm">
                <p className="text-slate-700">{p.title || p.name}</p>
                <ul className="text-xs text-slate-500">
                  {p.rounds.map((t) => (
                    <li key={t.round_number}>
                      Tura {t.round_number}: {okres(t.start_date, t.end_date)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  </Card>
);

const PrzebiegRekrutacji = () => {
  const auth = useAuth();
  const zalogowany = Boolean(auth?.user?.username);
  const [zgloszenia, setZgloszenia] = useState<Zgloszenie[] | null>(null);
  const [decyzje, setDecyzje] = useState<Decyzja[]>([]);
  const [kampanie, setKampanie] = useState<KampaniaHarmonogram[]>([]);
  const [doWycofania, setDoWycofania] = useState<Zgloszenie | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wczytaj = useCallback(() => {
    Promise.all([
      rekrutacjaApi.zgloszenia(),
      rekrutacjaApi.decyzje(),
      rekrutacjaApi.harmonogram().catch(() => [] as KampaniaHarmonogram[]),
    ])
      .then(([z, d, h]) => {
        setZgloszenia(z);
        setDecyzje(d);
        setKampanie(h);
      })
      .catch((e) => {
        setZgloszenia([]);
        setError(apiError(e));
      });
  }, []);

  useEffect(() => {
    if (zalogowany && !auth.loading) wczytaj();
  }, [zalogowany, auth?.loading, wczytaj]);

  const aktywne = useMemo(() => (zgloszenia ?? []).filter((z) => z.submission_status !== 'Withdrawn'), [zgloszenia]);
  const wycofane = useMemo(() => (zgloszenia ?? []).filter((z) => z.submission_status === 'Withdrawn'), [zgloszenia]);

  const wycofaj = async () => {
    if (!doWycofania) return;
    setBusy(true);
    setError(null);
    try {
      await rekrutacjaApi.wycofaj(doWycofania.name);
      wczytaj();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
      setDoWycofania(null);
    }
  };

  if (auth?.loading) return <LoadingSpinner message="Ładowanie..." />;

  if (!zalogowany) {
    return (
      <Card title="Zaloguj się">
        <p className="mb-4 text-sm text-slate-600">Przebieg rekrutacji zobaczysz po zalogowaniu na konto kandydata.</p>
        <ZalogujKandydata returnPath="/rekrutacja/przebieg" />
      </Card>
    );
  }

  if (zgloszenia === null) return <LoadingSpinner message="Ładowanie zgłoszeń..." />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Przebieg rekrutacji</h1>
      {error && <Alert kind="error">{error}</Alert>}

      {decyzje.length > 0 && (
        <Card title="Decyzje">
          <ul className="divide-y divide-slate-100">
            {decyzje.map((d) => (
              <li key={d.name} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>
                  <span className="font-medium text-slate-900">{d.programme_title || d.admission_programme}</span>
                  <span className="block text-xs text-slate-500">
                    {d.decision_number || d.name}
                    {d.published_on && ` · opublikowana ${formatData(d.published_on)}`}
                    {d.delivered_on && ` · doręczona ${formatData(d.delivered_on)}`}
                  </span>
                </span>
                <Badge variant={DECYZJA[d.status].variant}>{DECYZJA[d.status].label}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {aktywne.length === 0 ? (
        <Card title="Nie masz jeszcze zgłoszeń">
          <p className="mb-4 text-sm text-slate-600">Wybierz kierunek, na który chcesz się zgłosić.</p>
          <Link
            href="/rekrutacja/kierunki"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Icon icon="mdi:school-outline" fontSize={18} />
            Wybór kierunku
          </Link>
        </Card>
      ) : (
        aktywne.map((z) => <KartaZgloszenia key={z.name} zgloszenie={z} onWycofaj={setDoWycofania} />)
      )}

      <Harmonogram kampanie={kampanie} kierunki={new Set(aktywne.map((z) => z.admission_programme))} />

      {wycofane.length > 0 && (
        <Card title="Wycofane zgłoszenia">
          <ul className="space-y-1 text-sm text-slate-600">
            {wycofane.map((z) => (
              <li key={z.name}>
                {z.programme_title || z.admission_programme} <span className="text-xs text-slate-400">({z.name})</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmDialog
        isOpen={doWycofania !== null}
        onClose={() => setDoWycofania(null)}
        onConfirm={wycofaj}
        loading={busy}
        variant="danger"
        title="Wycofanie zgłoszenia"
        message={`Czy wycofać zgłoszenie na kierunek „${
          doWycofania?.programme_title || doWycofania?.admission_programme || ''
        }”? Możesz zgłosić się ponownie, dopóki trwa rejestracja.`}
        confirmText="Wycofuję"
        cancelText="Anuluj"
      />
    </div>
  );
};

PrzebiegRekrutacji.getLayout = rekrutacjaLayout;

export default PrzebiegRekrutacji;
