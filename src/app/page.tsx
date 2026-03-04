import VideoGrid from "../components/VideoGrid";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ freeText?: string }>;
}) {
  const { freeText } = await searchParams;

  return (
    <div>
      {freeText && <h2 style={{ marginBottom: 16 }}>Results for “{freeText}”</h2>}
      <VideoGrid search={freeText ?? ""} />
    </div>
  );
}

