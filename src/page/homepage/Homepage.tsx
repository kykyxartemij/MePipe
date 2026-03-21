import VideoGrid from './VideoGrid';

export default function Homepage({ searchParams }: { searchParams?: { freeText?: string } }) {
  const freeText = searchParams?.freeText ?? '';

  return (
    <div>
      {freeText && (
        <div className="mb-5 pl-3 border-l-2 border-(--art-primary)">
          <p className="text-xs text-muted uppercase tracking-wider mb-0.5">Search results</p>
          <h2 className="text-lg font-semibold">{freeText}</h2>
        </div>
      )}
      <VideoGrid search={freeText} />
    </div>
  );
}
