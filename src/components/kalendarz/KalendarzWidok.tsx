// 2026-11-10: siatka kalendarza (FullCalendar, licencja MIT). Ładowana
// tylko w przeglądarce (next/dynamic, ssr: false w pages/kalendarz) -
// FullCalendar mierzy elementy strony. Nie eksportować z components/index.ts.
import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import plLocale from '@fullcalendar/core/locales/pl';
import type { DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core';

import type { Zdarzenie } from '@/types/kalendarz';
import { kolorZdarzenia } from '@/utils/kalendarz';

export interface KalendarzWidokProps {
  zdarzenia: Zdarzenie[];
  /** Zmiana widocznego zakresu: `od` i `do` włącznie (RRRR-MM-DD). */
  onZakres: (start: Date, koniecWylacznie: Date) => void;
  onWybierz: (zdarzenie: Zdarzenie) => void;
}

const WIDOKI = 'dayGridMonth,timeGridWeek,listMonth';

const KalendarzWidok: React.FC<KalendarzWidokProps> = ({ zdarzenia, onZakres, onWybierz }) => {
  const events = useMemo<EventInput[]>(
    () =>
      zdarzenia.map((z) => {
        const kolor = kolorZdarzenia(z);
        return {
          id: z.id,
          title: z.title,
          start: z.start,
          end: z.end ?? undefined,
          allDay: z.allDay,
          backgroundColor: kolor,
          borderColor: kolor,
          extendedProps: { zdarzenie: z },
        };
      }),
    [zdarzenia]
  );

  // telefon: lista tygodnia zamiast siatki miesiąca
  const poczatkowyWidok =
    typeof window !== 'undefined' && window.innerWidth < 640 ? 'listWeek' : 'dayGridMonth';

  return (
    <div className="kalendarz rounded-xl border border-slate-200 bg-white p-2 shadow-sm sm:p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        locale={plLocale}
        timeZone="local"
        initialView={poczatkowyWidok}
        headerToolbar={{ left: 'prev,next today', center: 'title', right: WIDOKI }}
        buttonText={{ listMonth: 'lista' }}
        height="auto"
        firstDay={1}
        weekNumbers={false}
        nowIndicator
        dayMaxEvents={4}
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        events={events}
        datesSet={(arg: DatesSetArg) => onZakres(arg.start, arg.end)}
        eventClick={(arg: EventClickArg) => {
          arg.jsEvent.preventDefault();
          onWybierz(arg.event.extendedProps.zdarzenie as Zdarzenie);
        }}
      />
    </div>
  );
};

export default KalendarzWidok;
