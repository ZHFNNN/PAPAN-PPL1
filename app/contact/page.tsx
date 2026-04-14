'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function ContactPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('Contact Us');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formSent, setFormSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const menuItems = ['Profile', 'Settings', 'Contact Us', 'Help Center'];

  const handleMenuClick = (item: string) => {
    setActiveMenu(item);
    if (item === 'Profile') router.push('/profile');
    if (item === 'Settings') router.push('/settings');
    if (item === 'Help Center') router.push('/help');
  };

  const handleLogout = () => router.push('/login');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setFormSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setFormSent(false), 4000);
  };

  const contacts = [
    { icon: '📞', label: 'Telepon', value: '+62817 5683 6421', sub: 'Senin – Jumat, 08.00 – 17.00 WIB' },
    { icon: '📧', label: 'Email', value: 'support@papan.id', sub: 'Balasan dalam 1×24 jam kerja' },
    { icon: '📍', label: 'Kantor', value: 'Jatinangor, Sumedang', sub: 'Jawa Barat, Indonesia 45363' },
    { icon: '💬', label: 'Live Chat', value: 'Tersedia di aplikasi', sub: 'Respon cepat via WhatsApp' },
  ];

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.contentArea}>
        <div className={styles.container}>

          {/* Mobile toggle */}
          <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            <span className={styles.toggleIcon}>{sidebarOpen ? '✕' : '☰'}</span>
          </button>

          {/* Sidebar */}
          <div className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.sidebarVisible : styles.sidebarHidden}`}>
            <div className={styles.sidebar}>
              <h2 className={styles.sidebarTitle}>Pencari Properti</h2>
              <div className={styles.menuList}>
                {menuItems.map((item) => (
                  <button key={item} onClick={() => handleMenuClick(item)}
                    className={`${styles.menuButton} ${activeMenu === item ? styles.menuButtonActive : styles.menuButtonInactive}`}>
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
              <div className={styles.headerIcon}>📬</div>
              <div>
                <h1 className={styles.pageTitle}>Hubungi Kami</h1>
                <p className={styles.pageSubtitle}>Ada pertanyaan? Tim kami siap membantu kamu</p>
              </div>
            </div>

            {/* Contact Cards */}
            <div className={styles.contactGrid}>
              {contacts.map((c) => (
                <div key={c.label} className={styles.contactCard}>
                  <div className={styles.contactIcon}>{c.icon}</div>
                  <div>
                    <p className={styles.contactLabel}>{c.label}</p>
                    <p className={styles.contactValue}>{c.value}</p>
                    <p className={styles.contactSub}>{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className={styles.formCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>✉️</span>
                <h2 className={styles.cardTitle}>Kirim Pesan</h2>
              </div>

              {formSent ? (
                <div className={styles.successBox}>
                  <span className={styles.successIcon}>✓</span>
                  <div>
                    <p className={styles.successTitle}>Pesan Terkirim!</p>
                    <p className={styles.successDesc}>Tim kami akan merespons dalam 1×24 jam kerja.</p>
                  </div>
                </div>
              ) : (
                <div className={styles.formBody}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Nama Lengkap</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Masukkan nama kamu"
                        className={styles.formInput}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Email</label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="email@kamu.com"
                        className={styles.formInput}
                        type="email"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Topik</label>
                    <select name="subject" value={form.subject} onChange={handleChange} className={styles.formSelect}>
                      <option value="">Pilih topik pertanyaan</option>
                      <option value="akun">Masalah Akun</option>
                      <option value="properti">Informasi Properti</option>
                      <option value="pembayaran">Pembayaran & Transaksi</option>
                      <option value="teknis">Kendala Teknis</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Pesan</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tuliskan pertanyaan atau keluhanmu di sini..."
                      className={styles.formTextarea}
                      rows={5}
                    />
                  </div>

                  <button className={styles.submitBtn} onClick={handleSubmit}>
                    Kirim Pesan →
                  </button>
                </div>
              )}
            </div>

            {/* Social Media */}
            <div className={styles.socialCard}>
              <p className={styles.socialTitle}>Ikuti kami di media sosial</p>
              <div className={styles.socialRow}>
                {['Instagram', 'Twitter / X', 'LinkedIn', 'YouTube'].map(s => (
                  <div key={s} className={styles.socialChip}>{s}</div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}