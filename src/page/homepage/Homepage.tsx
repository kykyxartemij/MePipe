import VideoGrid from './VideoGrid';

export default function Homepage({ searchParams }: { searchParams?: { freeText?: string } }) {
  const freeText = searchParams?.freeText ?? '';

  return (
    <div>
      {freeText && <h2 style={{ marginBottom: 16 }}>Results for "{freeText}"</h2>}
      <VideoGrid search={freeText} />
    </div>
  );
}
