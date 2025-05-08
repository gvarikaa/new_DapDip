import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MainLayout } from "@/components/layout/MainLayout";
import PostDetail from "@/components/post/PostDetail";
import Comments from "@/components/comment/Comments";
import { truncateText } from "@/lib/utils";

interface PostPageProps {
  params: {
    postId: string;
  };
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { id: params.postId },
    include: {
      author: true,
    },
  });

  if (!post) {
    return {
      title: "Post Not Found | DapDip",
    };
  }

  const title = post.content
    ? truncateText(post.content, 50)
    : "Post by " + (post.author.name || "User");

  return {
    title: `${title} | DapDip`,
    description: post.content
      ? truncateText(post.content, 150)
      : "View this post on DapDip",
  };
}

export default async function PostPage({
  params,
}: PostPageProps): Promise<JSX.Element> {
  const { postId } = params;

  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl">
        <Suspense fallback={<div>Loading post...</div>}>
          <PostDetail postId={postId} />
        </Suspense>
        
        <div className="mt-6">
          <h2 className="mb-4 text-xl font-semibold">Comments</h2>
          <Suspense fallback={<div>Loading comments...</div>}>
            <Comments postId={postId} />
          </Suspense>
        </div>
      </div>
    </MainLayout>
  );
}