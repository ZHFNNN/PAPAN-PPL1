//propertyDetail/page.tsx
import { redirect } from 'next/navigation';

type LegacyPropertyDetailPageProps = {
	searchParams: Promise<{ id?: string | string[] }>;
};

export default async function PropertyDetailPage({ searchParams }: LegacyPropertyDetailPageProps) {
	const query = await searchParams;
	const rawId = Array.isArray(query.id) ? query.id[0] : query.id;

	if (rawId && rawId.trim()) {
		redirect(`/propertyDetail/${encodeURIComponent(rawId)}`);
	}

	redirect('/');
}
