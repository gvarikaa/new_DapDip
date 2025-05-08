"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { api } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";

interface ContentModerationProps {
  content: string;
  onModerationResult: (isSafe: boolean, issues: string[]) => void;
  autoModerate?: boolean;
}

export default function ContentModeration({
  content,
  onModerationResult,
  autoModerate = false,
}: ContentModerationProps): JSX.Element {
  const [isChecking, setIsChecking] = useState(false);
  const [moderationResult, setModerationResult] = useState<{
    isSafe: boolean;
    issues: string[];
    categories: Record<string, number>;
  } | null>(null);

  // Moderation mutation
  const moderateContent = api.ai.moderateContent.useMutation({
    onSuccess: (result) => {
      setModerationResult(result);
      onModerationResult(result.isSafe, result.issues);
      setIsChecking(false);
      
      if (!result.isSafe) {
        toast.error("Content moderation failed. Please review the issues.");
      }
    },
    onError: (error) => {
      setIsChecking(false);
      toast.error("Content moderation failed: " + error.message);
      onModerationResult(false, ["Moderation service error"]);
    },
  });

  // Auto-moderate when content changes
  useEffect(() => {
    if (autoModerate && content.trim().length > 50) {
      handleModerate();
    }
  }, [content, autoModerate]);

  const handleModerate = (): void => {
    if (!content.trim() || isChecking) return;
    
    setIsChecking(true);
    moderateContent.mutate({ text: content });
  };

  // If no moderation result yet, show only the button
  if (!moderationResult) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleModerate}
        disabled={isChecking || !content.trim()}
        className="flex items-center"
      >
        {isChecking ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking...
          </>
        ) : (
          <>
            <ShieldAlert className="mr-2 h-4 w-4" />
            Moderate Content
          </>
        )}
      </Button>
    );
  }

  // Show moderation result
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center space-x-2">
        {moderationResult.isSafe ? (
          <>
            <Check className="h-5 w-5 text-green-500" />
            <span className="font-medium text-green-500">Content is safe</span>
          </>
        ) : (
          <>
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <span className="font-medium text-destructive">Moderation issues found</span>
          </>
        )}
      </div>

      {!moderationResult.isSafe && moderationResult.issues.length > 0 && (
        <div className="mt-2 rounded-md bg-destructive/10 p-2">
          <p className="text-sm font-medium text-destructive">Issues:</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-destructive">
            {moderationResult.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Show category scores */}
      {Object.keys(moderationResult.categories).length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Category scores:</p>
          {Object.entries(moderationResult.categories)
            .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
            .map(([category, score]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-xs">{category}</span>
                <div className="flex w-32 items-center">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full ${
                        score > 0.7
                          ? "bg-red-500"
                          : score > 0.4
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>
                  <span className="ml-2 text-xs">{Math.round(score * 100)}%</span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}