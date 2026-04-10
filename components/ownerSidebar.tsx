'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from './ownerSidebar.module.css';

const MENU_ITEMS = [
  { href: '/owner/dashboard', label: 'Dashboard' },
  { href: '/owner/profile', label: 'Profile' },
  { href: '/owner/addProperty', label: 'Tambah Properti' },
  { href: '/owner/booster', label: 'Booster' },
  { href: '/owner/verify', label: 'Verifikasi' },
] as const;

interface OwnerSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function OwnerSidebar({ collapsed, onToggle }: OwnerSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [highlightStyle, setHighlightStyle] = useState({ top: '0px', height: '0px', opacity: 0 });

  const activeHref = pathname === '/owner' ? '/owner/dashboard' : pathname;

  useEffect(() => {
    const activeItem = MENU_ITEMS.find((item) => item.href === activeHref);
    if (!activeItem) {
      setHighlightStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }
    const activeEl = linkRefs.current[activeItem.href];
    if (!activeEl) return;
    setHighlightStyle({
      top: `${activeEl.offsetTop}px`,
      height: `${activeEl.offsetHeight}px`,
      opacity: 1,
    });
  }, [activeHref]);

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      {/* Sidebar panel */}
      <div className={`${styles.sidebarWrapper} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Pemilik Properti</h2>
          </div>

          <div className={styles.menuList}>
            <div
              className={styles.activeHighlight}
              style={{
                top: highlightStyle.top,
                height: highlightStyle.height,
                opacity: highlightStyle.opacity,
              }}
            />
            {MENU_ITEMS.map((item) => {
              const isActive = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  ref={(el) => { linkRefs.current[item.href] = el; }}
                  className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className={styles.sidebarActions}>
            <button
              onClick={() => router.push('/profile')}
              className={styles.switchModeButton}
            >
              Kembali ke Mode Pencari
            </button>
            <button
              onClick={() => router.push('/login')}
              className={styles.logoutButton}
            >
              <span className={styles.logoutText}>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toggle button — always visible */}
      <button
        className={`${styles.toggleButton} ${collapsed ? styles.rotated : ''}`}
        onClick={onToggle}
        title={collapsed ? 'Tampilkan sidebar' : 'Sembunyikan sidebar'}
        aria-label={collapsed ? 'Tampilkan sidebar' : 'Sembunyikan sidebar'}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M9 2L4 7L9 12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}