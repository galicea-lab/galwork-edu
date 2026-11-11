// ** React Imports
import { useEffect } from 'react';

// ** Next Imports
import { useRouter } from 'next/router';

// strona startowa prowadzi do ekranu właściwego dla roli:
// student - "Moje studia", wykładowca i administracja - plan zajęć,
// kandydat - rekrutacja. Czekamy na ustalenie roli (zapytanie do huba).
import { useAktywnaRola, useStatusSesji } from '@/hooks/useSesja';

const STRONA_STARTOWA: Record<string, string> = {
  student: '/studia',
  wykladowca: '/plan',
  dziekanat: '/plan',
  administrator: '/plan',
  kandydat: '/rekrutacja',
};

const Home = () => {
  const router = useRouter();
  const rola = useAktywnaRola();
  const status = useStatusSesji();

  useEffect(() => {
    // dopóki hub nie potwierdzi roli, nie wiadomo, dokąd prowadzić
    if (!rola && status !== 'ready') return;
    router.replace((rola && STRONA_STARTOWA[rola]) || '/plan');
  }, [rola, status, router]);
  return null;
};

export default Home;
