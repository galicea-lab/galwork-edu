// karta danych osobowych studenta (bez pełnych numerów dokumentów).
import React from 'react';
import { Icon } from '@iconify/react';

import type { DaneStudenta } from '@/types/studia';

interface StudentProfileCardProps {
  student: DaneStudenta;
}

const PLEC: Record<string, string> = {
  Male: 'mężczyzna',
  Female: 'kobieta',
};

const Wiersz: React.FC<{ icon: string; label: string; value?: string | null }> = ({
  icon,
  label,
  value,
}) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon icon={icon} fontSize={15} className="mt-0.5 text-slate-400" />
      <div>
        <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-xs text-slate-800">{value}</p>
      </div>
    </div>
  );
};

export const StudentProfileCard: React.FC<StudentProfileCardProps> = ({ student }) => {
  const dokument = student.nr_dowodu
    ? `dowód ${student.nr_dowodu}`
    : student.nr_paszportu
    ? `paszport ${student.nr_paszportu}`
    : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {student.zdjecie ? (
          <img
            src={student.zdjecie}
            alt=""
            className="h-16 w-16 rounded-full object-cover ring-1 ring-slate-200"
          />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon icon="mdi:account" fontSize={28} />
          </span>
        )}
        <div>
          <p className="text-base font-semibold text-slate-900">
            {[student.imie, student.drugie_imie, student.nazwisko].filter(Boolean).join(' ') || '—'}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {student.nr_albumu ? `nr albumu ${student.nr_albumu}` : 'brak numeru albumu'}
            {student.email ? ` · ${student.email}` : ''}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Wiersz icon="mdi:cake-variant-outline" label="Data urodzenia" value={student.data_urodzenia} />
        <Wiersz
          icon="mdi:gender-male-female"
          label="Płeć"
          value={student.plec ? PLEC[student.plec] || student.plec : null}
        />
        <Wiersz icon="mdi:flag-outline" label="Obywatelstwo" value={student.obywatelstwo} />
        <Wiersz icon="mdi:earth" label="Narodowość" value={student.narodowosc} />
        <Wiersz icon="mdi:email-outline" label="E-mail prywatny" value={student.email_prywatny} />
        <Wiersz icon="mdi:phone-outline" label="Telefon" value={student.telefon} />
        <Wiersz
          icon="mdi:map-marker-outline"
          label="Adres"
          value={[student.adres, student.miasto, student.kraj].filter(Boolean).join(', ') || null}
        />
        <Wiersz icon="mdi:card-account-details-outline" label="Dokument" value={dokument} />
        <Wiersz icon="mdi:calendar-check-outline" label="Data przyjęcia" value={student.data_przyjecia} />
      </dl>
    </div>
  );
};

export default StudentProfileCard;
