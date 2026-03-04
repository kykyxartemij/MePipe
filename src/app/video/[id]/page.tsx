import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CommentSection from "./CommentSection";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const video = await prisma.video.findUnique({
    where: { id },
    include: { genres: true },
  });

  if (!video) notFound();

  const comments = await prisma.comment.findMany({
    where: { videoId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2>{video.title}</h2>
      <video
        src={video.videoUrl}
        controls
        style={{ width: "100%", maxWidth: 800, borderRadius: 8 }}
      />
      <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
        {video.description}
      </p>
      <CommentSection videoId={id} initialComments={comments} />
    </div>
  );
}

