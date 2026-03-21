import VideoPage from '@/page/video/VideoPage';
import CommentSection from '@/page/video/components/CommentSection';
import SimilarVideos from '@/page/video/components/SimilarVideos';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex gap-6 max-lg:flex-col">
      <div className="flex-1 min-w-0">
        <VideoPage videoId={id} />
        <CommentSection videoId={id} />
      </div>
      <aside className="w-100 min-w-85 max-lg:w-full max-lg:min-w-0">
        <SimilarVideos videoId={id} />
      </aside>
    </div>
  );
}
