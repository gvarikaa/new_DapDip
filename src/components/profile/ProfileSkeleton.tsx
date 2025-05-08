export default function ProfileSkeleton(): JSX.Element {
  return (
    <div className="space-y-8 pb-8">
      {/* Profile header skeleton */}
      <div className="space-y-4">
        <div className="h-48 w-full rounded-lg bg-muted" />
        <div className="flex items-start space-x-4">
          <div className="-mt-16 h-32 w-32 rounded-full border-4 border-background bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-1/3 rounded bg-muted" />
            <div className="h-4 w-1/4 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
          <div className="h-10 w-24 rounded-full bg-muted" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="border-b">
        <div className="flex space-x-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-24 rounded bg-muted" />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 shadow">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}