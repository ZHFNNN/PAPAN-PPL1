// app/kategori/[kategori]/page.tsx
import KategoriPage from './KategoriPage';

type Props = { params: Promise<{ kategori: string }> };

export default async function Page({ params }: Props) {
  const { kategori } = await params;
  return <KategoriPage kategori={kategori} />;
}