// dawny adres kalendarza - przekierowanie na /kalendarz.
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CalendarRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/kalendarz');
  }, [router]);

  return null;
}
