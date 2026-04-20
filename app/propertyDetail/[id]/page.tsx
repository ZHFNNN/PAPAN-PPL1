import { Suspense } from 'react';
import PropertyDetailClient from '../PropertyDetailClient';

type PropertyDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PropertyDetailByIdPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<main>Memuat detail properti...</main>}>
      <PropertyDetailClient propertyId={id} />
    </Suspense>
  );
}
