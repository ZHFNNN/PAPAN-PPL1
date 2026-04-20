'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const BOOST_PACKAGES = [
	{ id: 'basic', title: 'Basic Boost', days: 3, price: 'Rp25.000' },
	{ id: 'pro', title: 'Pro Boost', days: 7, price: 'Rp55.000' },
	{ id: 'max', title: 'Max Boost', days: 14, price: 'Rp99.000' },
];

export default function OwnerBoosterPage() {
	const router = useRouter();

	return (
		<main className={styles.main}>
			<div className={styles.header}>
				<h1 className={styles.title}>Booster Properti</h1>
				<p className={styles.subtitle}>Naikkan visibilitas properti kamu dengan fitur booster.</p>
			</div>

			<div className={styles.cardWrap}>
				{BOOST_PACKAGES.map((pkg) => (
					<div key={pkg.id} className={styles.card}>
						<h2 className={styles.cardTitle}>{pkg.title}</h2>
						<p className={styles.cardMeta}>{pkg.days} hari tayang prioritas</p>
						<p className={styles.cardPrice}>{pkg.price}</p>
						<button
							className={styles.cardBtn}
							onClick={() => router.push('/owner/dashboard')}
						>
							Pilih Paket
						</button>
					</div>
				))}
			</div>
		</main>
	);
}
