import { X } from "lucide-react";
import { Post } from "@prisma/client";

interface PostAnalysisModalProps {
  post: Post;
  onClose: () => void;
}

interface AIAnalysis {
  topics: string[];
  tone: string;
  emotions: string[];
  keyThemes: string[];
  engagement: string;
  suggestions: string;
}

export default function PostAnalysisModal({
  post,
  onClose,
}: PostAnalysisModalProps): JSX.Element {
  const analysis = post.aiAnalysis as AIAnalysis;
  
  // Format sentiment score to percentage
  const sentimentScore = post.sentiment !== null ? post.sentiment : 0;
  const sentimentPercent = Math.round((sentimentScore + 1) * 50); // Convert -1 to 1 range to 0-100%
  
  // Get sentiment color based on score
  const getSentimentColor = (): string => {
    if (sentimentScore > 0.3) return "bg-green-500";
    if (sentimentScore < -0.3) return "bg-red-500";
    return "bg-yellow-500";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div 
        className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold">AI Content Analysis</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Sentiment Analysis */}
          <div>
            <h3 className="mb-3 font-medium">Sentiment Analysis</h3>
            <div className="h-6 w-full rounded-full bg-muted">
              <div 
                className={`h-full rounded-full ${getSentimentColor()}`}
                style={{ width: `${sentimentPercent}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span>Negative</span>
              <span>Neutral</span>
              <span>Positive</span>
            </div>
            <p className="mt-2 text-sm">
              Score: {sentimentScore.toFixed(2)} ({
                sentimentScore > 0.3 ? "Positive" : 
                sentimentScore < -0.3 ? "Negative" : "Neutral"
              })
            </p>
          </div>

          {/* Topics */}
          <div>
            <h3 className="mb-2 font-medium">Main Topics</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.topics.map((topic, index) => (
                <span 
                  key={index}
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Tone & Emotions */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium">Tone</h3>
              <p className="rounded-md bg-muted p-3">{analysis.tone}</p>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Emotions Detected</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.emotions.map((emotion, index) => (
                  <span 
                    key={index}
                    className="rounded-full bg-secondary/10 px-3 py-1 text-sm text-secondary-foreground"
                  >
                    {emotion}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Key Themes */}
          <div>
            <h3 className="mb-2 font-medium">Key Themes</h3>
            <ul className="list-inside list-disc space-y-2 rounded-md bg-muted p-3">
              {analysis.keyThemes.map((theme, index) => (
                <li key={index}>{theme}</li>
              ))}
            </ul>
          </div>

          {/* Engagement & Suggestions */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium">Predicted Engagement</h3>
              <div className="rounded-md bg-muted p-3">
                <div className="mb-2 flex items-center">
                  <span className="mr-2 font-medium">Level: </span>
                  <span 
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      analysis.engagement.toLowerCase().includes("high") 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" 
                        : analysis.engagement.toLowerCase().includes("medium")
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                    }`}
                  >
                    {analysis.engagement.split(" ")[0]} {/* Extract just the level */}
                  </span>
                </div>
                <p className="text-sm">
                  {analysis.engagement.includes(" ") 
                    ? analysis.engagement.substring(analysis.engagement.indexOf(" ") + 1)
                    : ""}
                </p>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Suggestions for Improvement</h3>
              <p className="rounded-md bg-muted p-3 text-sm">
                {analysis.suggestions}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t pt-4 text-xs text-muted-foreground">
          This analysis was generated by AI and is intended as general feedback only.
        </div>
      </div>
    </div>
  );
}