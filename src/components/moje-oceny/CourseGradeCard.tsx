// karta przedmiotu - ocena końcowa, ECTS i lista podejść
// (każde podejście to jeden zatwierdzony Assessment Result).
import React, { useState } from 'react';
import { Icon } from '@iconify/react';

import { Badge } from '@/components/common';
import type { OcenaPrzedmiotu, PodejscieOceny } from '@/types/oceny';

interface CourseGradeCardProps {
  ocena: OcenaPrzedmiotu;
}

function etykietaZaliczenia(zaliczone?: boolean | null): string {
  if (zaliczone === true) return 'zaliczone';
  if (zaliczone === false) return 'niezaliczone';
  return 'brak oceny';
}

function wariantZaliczenia(zaliczone?: boolean | null): 'success' | 'danger' | 'default' {
  if (zaliczone === true) return 'success';
  if (zaliczone === false) return 'danger';
  return 'default';
}

const Podejscie: React.FC<{ podejscie: PodejscieOceny; numer: number }> = ({ podejscie, numer }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 py-1.5 text-[11px] text-slate-600">
    <span className="inline-flex items-center gap-1.5">
      <Icon icon="mdi:numeric-1-circle-outline" fontSize={13} className="text-slate-400" />
      podejście {numer}
      {podejscie.data && <span className="text-slate-400">· {podejscie.data}</span>}
    </span>
    <span className="flex items-center gap-2">
      <span>
        {podejscie.punkty}/{podejscie.maksimum}
        {podejscie.procent !== null && podejscie.procent !== undefined
          ? ` (${podejscie.procent}%)`
          : ''}
      </span>
      {podejscie.ocena && <Badge variant="default">{podejscie.ocena}</Badge>}
      <Badge variant={wariantZaliczenia(podejscie.zaliczone)}>
        {etykietaZaliczenia(podejscie.zaliczone)}
      </Badge>
    </span>
  </div>
);

export const CourseGradeCard: React.FC<CourseGradeCardProps> = ({ ocena }) => {
  const [rozwinięte, setRozwinięte] = useState(false);
  const final = ocena.final;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            {ocena.przedmiot.name || ocena.przedmiot.code}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
            <span>{ocena.przedmiot.code}</span>
            {ocena.przedmiot.ects > 0 && <span>· {ocena.przedmiot.ects} ECTS</span>}
            {ocena.semestr && <span>· {ocena.semestr}</span>}
            {ocena.rok_akademicki && <span>· {ocena.rok_akademicki}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {final?.ocena && (
            <span
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-bold ${
                ocena.zaliczone
                  ? 'bg-emerald-50 text-emerald-700'
                  : ocena.zaliczone === false
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
              title="ocena końcowa"
            >
              {final.ocena}
            </span>
          )}
          <Badge variant={wariantZaliczenia(ocena.zaliczone)}>
            {etykietaZaliczenia(ocena.zaliczone)}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 py-1.5 text-[11px] text-slate-500">
        <span>
          {final?.procent !== null && final?.procent !== undefined
            ? `ostatni wynik: ${final.punkty}/${final.maksimum} (${final.procent}%)`
            : 'brak wyniku'}
          {ocena.najlepszy_procent !== null && ocena.najlepszy_procent !== undefined
            ? ` · najlepszy: ${ocena.najlepszy_procent}%`
            : ''}
        </span>
        {ocena.podejscia.length > 0 && (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 font-medium text-slate-600 hover:bg-slate-50"
            onClick={() => setRozwinięte((wartosc) => !wartosc)}
          >
            <Icon icon={rozwinięte ? 'mdi:chevron-up' : 'mdi:chevron-down'} fontSize={14} />
            {rozwinięte ? 'ukryj' : 'pokaż'} podejścia ({ocena.podejscia.length})
          </button>
        )}
      </div>

      {rozwinięte &&
        ocena.podejscia.map((podejscie, indeks) => (
          <Podejscie key={podejscie.id || indeks} podejscie={podejscie} numer={indeks + 1} />
        ))}
    </div>
  );
};

export default CourseGradeCard;
