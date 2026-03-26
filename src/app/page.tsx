import Homepage from '@/page/homepage/Homepage';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ freeText?: string }>;
}) {
  const params = await searchParams;
  return <Homepage searchParams={params} />;
}
