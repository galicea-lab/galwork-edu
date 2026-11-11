// 2026-11-10: wygląd serwisu w jednym miejscu - marka, nazwy, kolory i
// klasy Tailwinda używane przez layout. Chcąc zmienić wygląd (nazwa uczelni,
// logo, akcent), wystarczy edytować ten plik; struktura layoutu
// (layouts/app/AppLayout.tsx) się nie zmienia.
import CONFIG from '@/configs/config';

/** Marka i teksty stałe layoutu. */
export const MARKA = {
  /** Nazwa produktu - nagłówek paska bocznego i tytuł strony. */
  nazwa: 'Galwork Edu',
  /** Podtytuł pod nazwą (krótki, wersalikami). */
  podtytul: 'Wirtualna Uczelnia',
  /** Nazwa uczelni - stopka paska bocznego (NEXT_PUBLIC_UCZELNIA). */
  uczelnia: CONFIG.uczelnia,
  /** Ikona logo (nazwa z Iconify). */
  logo: 'mdi:school-outline',
  wersja: 'v1.0',
  /** Krótki opis w <meta name="description">. */
  opis: 'Wirtualna Uczelnia - plan zajęć, oceny, frekwencja, legitymacja i sprawy studenckie',
};

/**
 * Klasy Tailwinda dla elementów chrome'u.
 *
 * Paleta: `marka-*` (granat) to tło nawigacji, `akcent-*` (złoto) to wyróżnik
 * aktywnej pozycji i logo. Definicje kolorów: tailwind.config.js.
 */
export const KLASY = {
  /** Tło paska bocznego (gradient granatu). */
  pasekBoczny: 'bg-gradient-to-b from-marka-900 via-marka-950 to-[#0b1024]',
  /** Logo - kafel z gradientem złota. */
  logo: 'bg-gradient-to-br from-akcent-300 via-akcent-400 to-akcent-600 text-marka-950 shadow-lg shadow-akcent-500/20',
  /** Etykieta grupy menu. */
  grupaMenu: 'text-[10px] font-semibold uppercase tracking-[0.16em] text-marka-300/70',
  /** Pozycja menu (nieaktywna). */
  pozycja: 'text-marka-100/75 hover:bg-white/[0.07] hover:text-white',
  /** Pozycja menu (aktywna). */
  pozycjaAktywna: 'bg-white/[0.12] text-white font-semibold shadow-sm',
  /** Wskaźnik aktywnej pozycji po lewej stronie. */
  wskaznik: 'bg-akcent-400',
  /** Nagłówek strony (górny pasek). */
  naglowek: 'bg-white/85 border-b border-slate-200/70 backdrop-blur-md',
  /** Tło obszaru roboczego. */
  tlo: 'bg-[#f5f7fb]',
};
