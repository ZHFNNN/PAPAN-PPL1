// app/owner/layout.tsx
'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OwnerSidebar from '@/components/ownerSidebar';
import styles from './layout.module.css';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.layout}>
        <OwnerSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((p) => !p)}
        />
        <main className={styles.main}>{children}</main>
      </div>

      <Footer />
    </div>
  );
}