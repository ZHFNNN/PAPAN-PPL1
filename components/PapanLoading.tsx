'use client';

import styles from './PapanLoading.module.css';

interface PapanLoadingProps {
  /** Teks yang muncul di bawah animasi. Default: "Memuat..." */
  label?: string;
  /** Ukuran komponen: 'sm' | 'md' | 'lg'. Default: 'md' */
  size?: 'sm' | 'md' | 'lg';
}

export default function PapanLoading({
  label = 'Memuat...',
  size = 'md',
}: PapanLoadingProps) {
  return (
    <div className={`${styles.wrapper} ${styles[size]}`} aria-label={label} role="status">
      {/* Tiang dan papan */}
      <div className={styles.postWrapper}>
        <div className={styles.postTop} />
        <div className={styles.post} />
        <div className={styles.sign}>
          <span className={styles.signTop}>DIJUAL</span>
          <hr className={styles.signDivider} />
          <span className={styles.signBottom}>DISEWA</span>
        </div>
      </div>

      {/* Gerbang */}
      <div className={styles.gateRow}>
        <div className={`${styles.gate} ${styles.gateLeft}`}>
          <div className={styles.gateBar} />
          <div className={styles.gateBar} />
          <div className={styles.gateBar} />
        </div>

        <div className={styles.gateCenter} />

        <div className={`${styles.gate} ${styles.gateRight}`}>
          <div className={styles.gateBar} />
          <div className={styles.gateBar} />
          <div className={styles.gateBar} />
        </div>
      </div>

      {/* Nama merek */}
      <p className={styles.brand}>PAPAN</p>

      {/* Progress bar */}
      <div className={styles.progressTrack}>
        <div className={styles.progressBar} />
      </div>

      {/* Label */}
      {label && <p className={styles.label}>{label}</p>}
    </div>
  );
}
