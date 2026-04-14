'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

const DEFAULT_AVATAR = '/images/default-avatar.png';

type KycStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

type UserProfile = {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  kycStatus: KycStatus;
  createdAt: string;
  gender?: string;
  birthDate?: string;
  incomeRange?: string;
};

const KYC_CONFIG: Record<KycStatus, {
  emoji: string;
  title: string;
  desc: string;
  btnLabel?: string;
  btnHref?: string;
  colorClass: string;
}> = {
  NONE: {
    emoji: '🔒',
    title: 'Belum Terverifikasi',
    desc: 'Verifikasi identitasmu untuk bisa menambahkan properti dan mengakses semua fitur PAPAN.',
    btnLabel: 'Mulai Verifikasi',
    btnHref: '/owner/verify',
    colorClass: 'kycNone',
  },
  PENDING: {
    emoji: '⏳',
    title: 'Sedang Ditinjau',
    desc: 'Pengajuan verifikasi kamu sedang diproses oleh tim kami. Proses peninjauan 1×24 jam kerja.',
    colorClass: 'kycPending',
  },
  APPROVED: {
    emoji: '✅',
    title: 'Terverifikasi',
    desc: 'Identitasmu telah berhasil diverifikasi. Kamu bisa menambahkan dan mengelola properti.',
    btnLabel: 'Tambah Properti',
    btnHref: '/owner/addProperty',
    colorClass: 'kycApproved',
  },
  REJECTED: {
    emoji: '❌',
    title: 'Pengajuan Ditolak',
    desc: 'Pengajuan verifikasimu ditolak. Silakan cek catatan admin dan ajukan ulang.',
    btnLabel: 'Ajukan Ulang',
    btnHref: '/owner/verify',
    colorClass: 'kycRejected',
  },
};

function KycStatusCard({ status, onNavigate }: { status: KycStatus; onNavigate: (href: string) => void }) {
  const config = KYC_CONFIG[status];
  return (
    <div className={`${styles.kycCard} ${styles[config.colorClass]}`}>
      <div className={styles.kycLeft}>
        <span className={styles.kycEmoji}>{config.emoji}</span>
        <div>
          <p className={styles.kycTitle}>Status KYC: {config.title}</p>
          <p className={styles.kycDesc}>{config.desc}</p>
        </div>
      </div>
      {config.btnLabel && config.btnHref && (
        <button className={styles.kycBtn} onClick={() => onNavigate(config.btnHref!)}>
          {config.btnLabel}
        </button>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>(DEFAULT_AVATAR);
  const [activeMenu, setActiveMenu] = useState('Profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Gagal memuat profil.');
        }
        const data: UserProfile = await res.json();
        setProfile(data);
      } catch (err) {
        setError('Tidak dapat memuat data profil. Coba lagi nanti.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    router.push('/login');
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleSwitchMode = () => {
    router.push('/owner/verify');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan.');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setAvatarSrc(objectUrl);
    // TODO: Upload ke server
  };

  const menuItems = ['Profile', 'Settings', 'Contact Us', 'Help Center'];
  
  const handleMenuClick = (item: string) => {
  setActiveMenu(item);
  if (item === 'Settings') router.push('/settings');
  if (item === 'Contact Us') router.push('/contact');
  if (item === 'Help Center') router.push('/help');
};

  const kycLabel: Record<KycStatus, string> = {
    NONE: 'Belum Verifikasi',
    PENDING: 'Menunggu Verifikasi',
    APPROVED: 'Terverifikasi ✓',
    REJECTED: 'Ditolak',
  };

  const profileFields = profile
    ? [
        { label: 'Nama', value: profile.name },
        { label: 'Email', value: profile.email },
        { label: 'Jenis Kelamin', value: profile.gender ?? 'Laki-laki' },
        { label: 'Tanggal Lahir', value: profile.birthDate ?? '14 Februari 1997' },
        { label: 'Nomor Handphone', value: profile.phoneNumber },
        { label: 'Range Pendapatan', value: profile.incomeRange ?? '5 Juta - 10 Juta' },
      ]
    : [];

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.contentArea}>
        <div className={styles.container}>

          {/* ── Sidebar Toggle Button (mobile) ── */}
          <button
            className={styles.sidebarToggle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <span className={styles.toggleIcon}>
              {sidebarOpen ? '✕' : '☰'}
            </span>
          </button>

          {/* ── Left Sidebar ── */}
          <div className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.sidebarVisible : styles.sidebarHidden}`}>
            <div className={styles.sidebar}>
              <h2 className={styles.sidebarTitle}>
                {profile?.role === 'ADMIN' ? 'Admin' : 'Pencari Properti'}
              </h2>

              <div className={styles.menuList}>
                {menuItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleMenuClick(item)}
                    className={`${styles.menuButton} ${
                      activeMenu === item
                        ? styles.menuButtonActive
                        : styles.menuButtonInactive
                    }`}
                  >
                    <p className={`${styles.menuLabel} ${
                      activeMenu === item ? styles.menuLabelActive : styles.menuLabelInactive
                    }`}>
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

          {/* ── Main Content (Right Panel) ── */}
          <div className={`${styles.mainContent} ${!sidebarOpen ? styles.mainContentFull : ''}`}>
            {isLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p>Memuat profil...</p>
              </div>
            ) : error ? (
              <div className={styles.errorState}>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className={styles.retryBtn}>
                  Coba Lagi
                </button>
              </div>
            ) : (
              <>
                {/* Profile Card */}
                <div className={styles.profileCard}>
                  <div className={styles.profileCardInner}>

                    {/* Avatar */}
                    <div className={styles.avatarSection}>
                      <div
                        className={styles.avatarWrapper}
                        onClick={handleAvatarClick}
                        title="Klik untuk ganti foto"
                      >
                        <img
                          alt="Profile"
                          className={styles.avatarImage}
                          src={avatarSrc}
                          onError={() => setAvatarSrc(DEFAULT_AVATAR)}
                        />
                        <div className={styles.avatarOverlay}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                            <path d="M12 15.2A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4zm6.4-10.4H5.6A2.4 2.4 0 0 0 3.2 7.2v9.6a2.4 2.4 0 0 0 2.4 2.4h12.8a2.4 2.4 0 0 0 2.4-2.4V7.2a2.4 2.4 0 0 0-2.4-2.4zm-1.6-2.4H7.2L8.8.8h6.4l1.6 2.4z"/>
                          </svg>
                          <p className={styles.overlayText}>Ganti Foto</p>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className={styles.hiddenInput}
                        onChange={handleFileChange}
                      />
                      {profile && (
                        <p className={styles.avatarName}>{profile.name}</p>
                      )}
                      <p className={styles.avatarHelpText}>Klik foto untuk mengubah</p>
                    </div>

                    {/* Profile Fields */}
                    <div className={styles.fieldsGrid}>
                      {profileFields.map(({ label, value }) => (
                        <div key={label}>
                          <p className={styles.fieldLabel}>{label}</p>
                          <div className={styles.fieldValueWrapper}>
                            <p className={styles.fieldValue}>{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* KYC Status */}
                {profile && (
                  <div className={styles.kycSection}>
                    <KycStatusCard status={profile.kycStatus} onNavigate={(href) => router.push(href)} />
                  </div>
                )}

                {/* Action Buttons */}
                <div className={styles.actionButtons}>
                  <button onClick={handleEditProfile} className={styles.editButton}>
                    <p className={styles.editButtonText}>Edit Profile</p>
                  </button>
                  <button onClick={handleSwitchMode} className={styles.ownerModeButton}>
                    <p className={styles.ownerModeButtonText}>Aktifkan Mode Pemilik Properti</p>
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}