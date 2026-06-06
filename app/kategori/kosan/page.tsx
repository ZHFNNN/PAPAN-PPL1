'use client';

// app/(main)/kategori/kosan/page.tsx

import KategoriPage from '../[kategori]/KategoriPage';

const HOTSPOTS = [
  {
    id: 'apartemen',
    href: '/kategori/apartemen',
    img: '/images/apartOverlay.png',
    left: 24, top: 18, width: 18, height: 72,
  },
  {
    id: 'rumah',
    href: '/kategori/rumah',
    img: '/images/rumahOverlay.png',
    left: 44, top: 25, width: 16, height: 65,
  },
  {
    id: 'kosan',
    href: '/kategori/kosan',
    img: '/images/kosanOverlay.png',
    left: 62, top: 18, width: 18, height: 72,
  },
] as const;

export default function KosanPage() {
  return (
    <KategoriPage
      aktif="Kosan"
      categoryApiValue="KOSAN"
      bgImage="/images/bgHomeKosan.jpeg"
      hotspots={HOTSPOTS}
    />
  );
}