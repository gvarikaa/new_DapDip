import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MainLayout } from "@/components/layout/MainLayout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { name: true, username: true },
  });

  if (!user) {
    return {
      title: "User Not Found | DapDip",
    };
  }

  const displayName = user.name || user.username || "User";

  return {
    title: `${displayName} | DapDip`,
    description: `${displayName}'s profile on DapDip`,
  };
}

export default async function ProfilePage({
  params,
}: ProfilePageProps): Promise<JSX.Element> {
  const { userId } = params;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl">
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileHeader userId={userId} />
          <ProfileTabs userId={userId} />
        </Suspense>
      </div>
    </MainLayout>
  );
}