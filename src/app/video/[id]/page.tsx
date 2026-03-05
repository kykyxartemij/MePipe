import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CommentSection from "./CommentSection";
import VideoPlayer from "@/components/VideoPlayer";
import RelatedVideos from "@/components/RelatedVideos";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const video = await prisma.video.findUnique({
    where: { id },
  });

  if (!video) notFound();

  const [comments, genres] = await Promise.all([
    video.commentIds.length > 0
      ? prisma.comment.findMany({
          where: { id: { in: video.commentIds.slice(0, 10) } },
        })
      : Promise.resolve([]),
    prisma.genre.findMany({ where: { id: { in: video.genreIds } } }),
  ]);
  const totalComments = video.commentIds.length;

  return (
    <>
      <style>{`
        .video-page{display:flex;gap:24px}
        .video-main{flex:1;min-width:0}
        .video-sidebar{width:400px;min-width:340px}
        @media(max-width:1024px){
          .video-page{flex-direction:column}
          .video-sidebar{width:100%}
        }
      `}</style>
      <div className="video-page">
        <div className="video-main">
          <VideoPlayer src={video.videoUrl} />
          <h2 style={{ marginTop: 12, marginBottom: 4, fontSize: "1.2rem" }}>{video.title}</h2>
          {genres.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              {genres.map((g) => (
                <span key={g.id} style={{ fontSize: 12, background: "#222", color: "#aaa", padding: "2px 10px", borderRadius: 12 }}>
                  {g.name}
                </span>
              ))}
            </div>
          )}
          <p style={{ color: "#999", fontSize: 14, marginTop: 0 }}>
            {video.description}
          </p>
          <CommentSection videoId={id} initialComments={comments} totalComments={totalComments} />
        </div>
        <aside className="video-sidebar">
          <RelatedVideos videoId={id} />
        </aside>
      </div>
    </>
  );
}

