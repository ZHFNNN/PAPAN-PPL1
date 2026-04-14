'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

type ToggleSetting = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

type SelectSetting = {
  id: string;
  label: string;
  description: string;
  value: string;
  options: string[];
};

export default function SettingsPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('Settings');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saved, setSaved] = useState(false);

  const [toggles, setToggles] = useState<ToggleSetting[]>([
    { id: 'emailNotif', label: 'Notifikasi Email', description: 'Terima pembaruan dan informasi properti via email', enabled: true },
    { id: 'smsNotif', label: 'Notifikasi SMS', description: 'Terima notifikasi transaksi via SMS', enabled: false },
    { id: 'pushNotif', label: 'Notifikasi Push', description: 'Notifikasi langsung di browser atau aplikasi', enabled: true },
    { id: 'newsletter', label: 'Newsletter', description: 'Tips properti dan tren pasar mingguan', enabled: false },
    { id: 'twoFactor', label: 'Verifikasi Dua Langkah', description: 'Tingkatkan keamanan akun dengan OTP', enabled: false },
    { id: 'darkMode', label: 'Mode Gelap', description: 'Tampilan antarmuka dengan tema gelap', enabled: false },
  ]);

  const [selects, setSelects] = useState<SelectSetting[]>([
    { id: 'language', label: 'Bahasa', description: 'Pilih bahasa antarmuka', value: 'Indonesia', options: ['Indonesia', 'English', 'Javanese'] },
    { id: 'currency', label: 'Mata Uang', description: 'Satuan mata uang untuk harga properti', value: 'IDR (Rp)', options: ['IDR (Rp)', 'USD ($)', 'SGD (S$)'] },
    { id: 'privacy', label: 'Privasi Profil', description: 'Siapa yang dapat melihat profilmu', value: 'Publik', options: ['Publik', 'Hanya Saya', 'Terverifikasi'] },
  ]);

  const menuItems = ['Profile', 'Settings', 'Contact Us', 'Help Center'];

  const handleMenuClick = (item: string) => {
    setActiveMenu(item);
    if (item === 'Profile') router.push('/profile');
    if (item === 'Contact Us') router.push('/contact');
    if (item === 'Help Center') router.push('/help');
  };

  const handleToggle = (id: string) => {
    setToggles(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  const handleSelectChange = (id: string, value: string) => {
    setSelects(prev => prev.map(s => s.id === id ? { ...s, value } : s));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => router.push('/login');

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.contentArea}>
        <div className={styles.container}>

          {/* Mobile toggle */}
          <button
            className={styles.sidebarToggle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <span className={styles.toggleIcon}>{sidebarOpen ? '✕' : '☰'}</span>
          </button>

          {/* Sidebar */}
          <div className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.sidebarVisible : styles.sidebarHidden}`}>
            <div className={styles.sidebar}>
              <h2 className={styles.sidebarTitle}>Pencari Properti</h2>
              <div className={styles.menuList}>
                {menuItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleMenuClick(item)}
                    className={`${styles.menuButton} ${activeMenu === item ? styles.menuButtonActive : styles.menuButtonInactive}`}
                  >
                    <p className={`${styles.menuLabel} ${activeMenu === item ? styles.menuLabelActive : styles.menuLabelInactive}`}>
                      {item}
                    </p>
                  </button>
                ))}
              </div>
              <button onClick={handleLogout} className={styles.logoutButton}>
                <p className={styles.logoutText}>Log Out</p>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className={`${styles.mainContent} ${!sidebarOpen ? styles.mainContentFull : ''}`}>

            {/* Header */}
            <div className={styles.pageHeader}>
              <div className={styles.headerIcon}>⚙️</div>
              <div>
                <h1 className={styles.pageTitle}>Pengaturan</h1>
                <p className={styles.pageSubtitle}>Kelola preferensi dan keamanan akunmu</p>
              </div>
            </div>

            {/* Notification Settings */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>🔔</span>
                <h2 className={styles.cardTitle}>Notifikasi & Preferensi</h2>
              </div>
              <div className={styles.toggleList}>
                {toggles.map((toggle) => (
                  <div key={toggle.id} className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                      <p className={styles.toggleLabel}>{toggle.label}</p>
                      <p className={styles.toggleDesc}>{toggle.description}</p>
                    </div>
                    <button
                      className={`${styles.toggle} ${toggle.enabled ? styles.toggleOn : styles.toggleOff}`}
                      onClick={() => handleToggle(toggle.id)}
                      aria-label={toggle.label}
                    >
                      <span className={`${styles.toggleKnob} ${toggle.enabled ? styles.knobOn : styles.knobOff}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Select Settings */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>🌐</span>
                <h2 className={styles.cardTitle}>Lokalisasi & Privasi</h2>
              </div>
              <div className={styles.selectList}>
                {selects.map((sel) => (
                  <div key={sel.id} className={styles.selectRow}>
                    <div className={styles.selectInfo}>
                      <p className={styles.selectLabel}>{sel.label}</p>
                      <p className={styles.selectDesc}>{sel.description}</p>
                    </div>
                    <select
                      className={styles.selectInput}
                      value={sel.value}
                      onChange={(e) => handleSelectChange(sel.id, e.target.value)}
                    >
                      {sel.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className={styles.dangerCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>⚠️</span>
                <h2 className={styles.dangerTitle}>Zona Bahaya</h2>
              </div>
              <div className={styles.dangerRow}>
                <div>
                  <p className={styles.dangerLabel}>Hapus Akun</p>
                  <p className={styles.dangerDesc}>Tindakan ini permanen dan tidak dapat dibatalkan</p>
                </div>
                <button className={styles.dangerBtn}>Hapus Akun</button>
              </div>
            </div>

            {/* Save Button */}
            <div className={styles.saveRow}>
              <button
                className={`${styles.saveBtn} ${saved ? styles.saveBtnSuccess : ''}`}
                onClick={handleSave}
              >
                {saved ? '✓ Tersimpan!' : 'Simpan Perubahan'}
              </button>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}