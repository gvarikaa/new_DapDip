import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";

export default function UserNotFound(): JSX.Element {
  return (
    <MainLayout>
      <div className="container flex flex-col items-center justify-center py-20">
        <h1 className="text-4xl font-bold">User Not Found</h1>
        <p className="mt-4 text-center text-muted-foreground">
          The user you're looking for doesn't exist or has been removed.
        </p>
        <div className="mt-8 flex space-x-4">
          <Link
            href="/"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Go Home
          </Link>
          <Link
            href="/explore"
            className="rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-muted"
          >
            Explore Users
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}