// app/kategori/[kategori]/page.tsx
import { redirect } from 'next/navigation';
import KategoriPage from './KategoriPage';

type Props = { params: Promise<{ kategori: string }> };

const HOTSPOTS = [
  {
    id: 'apartemen',
    href: '/kategori/apartemen',
    img: '/images/apartOverlay.png',
    left: 24,
    top: 18,
    width: 18,
    height: 72,
  },
  {
    id: 'rumah',
    href: '/kategori/rumah',
    img: '/images/rumahOverlay.png',
    left: 44,
    top: 25,
    width: 16,
    height: 65,
  },
  {
    id: 'kosan',
    href: '/kategori/kosan',
    img: '/images/kosanOverlay.png',
    left: 62,
    top: 18,
    width: 18,
    height: 72,
  },
] as const;

const KATEGORI_CONFIG = {
  apartemen: {
    aktif: 'Apartemen',
    categoryApiValue: 'APARTEMEN',
    bgImage: '/images/bgHomeApart.png',
    hotspots: HOTSPOTS,
  },
  rumah: {
    aktif: 'Rumah',
    categoryApiValue: 'RUMAH',
    bgImage: '/images/bgHomeRumah.png',
    hotspots: HOTSPOTS,
  },
  kosan: {
    aktif: 'Kosan',
    categoryApiValue: 'KOSAN',
    bgImage: '/images/bgHomeKosan.png',
    hotspots: HOTSPOTS,
  },
} as const;

export default async function Page({ params }: Props) {
  const { kategori } = await params;
  const key = (kategori ?? '').toLowerCase();
  const config = KATEGORI_CONFIG[key as keyof typeof KATEGORI_CONFIG];

  if (!config) {
    redirect('/');
  }

  return (
    <KategoriPage
      aktif={config.aktif}
      categoryApiValue={config.categoryApiValue}
      bgImage={config.bgImage}
      hotspots={config.hotspots}
    />
  );
}