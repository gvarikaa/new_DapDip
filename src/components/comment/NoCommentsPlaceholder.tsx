import { MessageSquare } from "lucide-react";

export default function NoCommentsPlaceholder(): JSX.Element {
  return (
    <div className="rounded-lg border bg-card p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-6 w-6 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-medium">No comments yet</h3>
      
      <p className="mt-2 text-muted-foreground">
        Be the first to share your thoughts on this post.
      </p>
    </div>
  );
}