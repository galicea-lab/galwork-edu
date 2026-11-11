// 2026-11-10: dawna lista "Zdarzenia i terminy" - przekierowanie na /kalendarz.
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function EventsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/kalendarz');
  }, [router]);

  return null;
}
