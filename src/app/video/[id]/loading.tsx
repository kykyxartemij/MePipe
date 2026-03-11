export default function Loading() {
  return (
    <div className="video-page">
      <div className="video-main">
        <div className="shimmer w-full rounded-xl" style={{ aspectRatio: '16/9' }} />
        <div className="shimmer h-6 w-3/5 mt-3" />
        <div className="flex gap-1.5 mt-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="shimmer h-5 w-16 rounded-full" />
          ))}
        </div>
        <div className="shimmer h-3.5 w-4/5 mt-3" />
        <div className="shimmer h-3.5 w-2/5 mt-2" />
      </div>
      <aside className="video-sidebar">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex gap-2 p-1 mb-2">
            <div className="shimmer rounded-lg" style={{ width: 168, minWidth: 168, aspectRatio: '16/9' }} />
            <div className="flex-1">
              <div className="shimmer h-3.5 w-11/12 mb-2" />
              <div className="shimmer h-2.5 w-8/12" />
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}
