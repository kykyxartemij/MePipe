import dynamic from 'next/dynamic';

const UploadForm = dynamic(() => import('@/page/upload/components/UploadForm'), {
  loading: () => <UploadFormSkeleton />,
});

function UploadFormSkeleton() {
  return (
    <div className="max-w-[500px] mx-auto">
      <div className="shimmer h-8 w-1/3 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="shimmer h-10 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="max-w-[500px] mx-auto">
      <h2 className="mb-4 text-lg font-semibold">Upload Video</h2>
      <UploadForm />
    </div>
  );
}
