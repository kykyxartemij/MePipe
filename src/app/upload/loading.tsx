import UploadForm from '@/page/upload/components/UploadForm';

export default function Loading() {
  return (
    <div className="">
      <h2 className="mb-4 text-lg font-semibold">Upload Video</h2>
      <UploadForm loading />
    </div>
  );
}
