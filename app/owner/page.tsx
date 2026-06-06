'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const QUICK_LINKS = [
	{
		title: 'Dashboard Owner',
		desc: 'Lihat statistik properti dan performa listing.',
		href: '/owner/dashboard',
	},
	{
		title: 'Tambah Properti',
		desc: 'Buat listing properti baru dengan detail lengkap.',
		href: '/owner/addProperty',
	},
	{
		title: 'Booster',
		desc: 'Promosikan properti agar lebih cepat dilihat.',
		href: '/owner/booster',
	},
	{
		title: 'Verifikasi Owner',
		desc: 'Lengkapi verifikasi identitas pemilik properti.',
		href: '/owner/verify',
	},
	{
		title: 'Profile Owner',
		desc: 'Atur profil dan informasi akun pemilik.',
		href: '/owner/profile',
	},
];

export default function OwnerPage() {
	const router = useRouter();

	return (
		<main className={styles.main}>
			<div className={styles.heroCard}>
				<h1 className={styles.title}>Owner Center</h1>
				<p className={styles.subtitle}>
					Kelola semua aktivitas pemilik properti dari satu tempat.
				</p>
			</div>

			<div className={styles.grid}>
				{QUICK_LINKS.map((item) => (
					<button
						key={item.href}
						className={styles.linkCard}
						onClick={() => router.push(item.href)}
					>
						<h2 className={styles.linkTitle}>{item.title}</h2>
						<p className={styles.linkDesc}>{item.desc}</p>
						<span className={styles.linkAction}>Buka →</span>
					</button>
				))}
			</div>
		</main>
	);
}
