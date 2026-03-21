import UploadForm from '@/page/upload/components/UploadForm';

export default function Loading() {
  return (
    <div className="max-w-125 mx-auto">
      <h2 className="mb-4 text-lg font-semibold">Upload Video</h2>
      <UploadForm loading />
    </div>
  );
}
