// app/owner/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OwnerSidebar from '@/components/ownerSidebar';
import styles from './layout.module.css';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isVerifyPage = pathname === '/owner/verify';
  const hideSidebar = pathname.startsWith('/owner/profile/edit');

  useEffect(() => {
    if (isVerifyPage) return;

    let cancelled = false;

    const checkOwnerAccess = async () => {
      try {
        const res = await fetch('/api/profile');

        if (res.status === 401) {
          if (!cancelled) router.replace('/login');
          return;
        }

        if (!res.ok) return;

        const data = (await res.json()) as { kycStatus?: string };
        if (!cancelled && data.kycStatus !== 'APPROVED') {
          router.replace('/owner/verify');
        }
      } catch {
        // ignore
      }
    };

    void checkOwnerAccess();

    return () => {
      cancelled = true;
    };
  }, [isVerifyPage, router]);

  if (isVerifyPage) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.page} ${hideSidebar ? styles.pagePlain : ''}`}>
      <Navbar />

      <div className={`${styles.layout} ${hideSidebar ? styles.layoutPlain : ''}`}>
        {!hideSidebar && (
          <OwnerSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((p) => !p)}
          />
        )}
        <main className={`${styles.main} ${hideSidebar ? styles.mainPlain : ''}`}>{children}</main>
      </div>

      <Footer />
    </div>
  );
}