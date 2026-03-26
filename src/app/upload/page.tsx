import type { Metadata } from 'next';
import UploadForm from '@/page/upload/components/UploadForm';
import ArtTitle from '@/components/ui/ArtTitle';

export const metadata: Metadata = { title: 'Upload' };

export default function Page() {
  return (
    <div className="max-w-2xl mx-auto">
      <ArtTitle size="lg" title="Upload Video" className="mb-6" />
      <div className="bg-(--bg) border border-(--border) rounded-xl p-6">
        <UploadForm />
      </div>
    </div>
  );
}
