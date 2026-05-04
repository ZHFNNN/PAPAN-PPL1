'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PostLoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const checkPersonalization = async () => {
      try {
        const res = await fetch('/api/personalisasi', { cache: 'no-store' });

        if (res.status === 401) {
          if (!cancelled) router.replace('/login');
          return;
        }

        if (!res.ok) {
          if (!cancelled) router.replace('/');
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        if (!data) {
          router.replace('/personalisasi');
          return;
        }

        router.replace('/');
      } catch {
        if (!cancelled) router.replace('/');
      }
    };

    void checkPersonalization();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
