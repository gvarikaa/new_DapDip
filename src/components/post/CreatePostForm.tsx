import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Smile, X, Upload, Sparkles } from "lucide-react";

import { api } from "@/lib/trpc/client";
import { PostCreateInput } from "@/lib/validations/post";

export default function CreatePostForm(): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();
  
  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      setContent("");
      setSelectedFiles([]);
      setPreviewUrls([]);
      utils.post.getFeed.invalidate();
      if (session?.user) {
        utils.post.getUserPosts.invalidate({ userId: session.user.id });
      }
      router.push("/");
    },
    onError: (error) => {
      alert(`Error creating post: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const analyzeContent = api.ai.generatePostSuggestions.useMutation({
    onSuccess: (data) => {
      setIsAnalyzing(false);
      // Show suggestions in a dialog or below the form
      alert("Suggestions generated! Here's one: " + data[0].content);
    },
    onError: (error) => {
      alert(`Error analyzing content: ${error.message}`);
      setIsAnalyzing(false);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles: File[] = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    
    // Create preview URLs
    const newPreviewUrls: string[] = [];
    newFiles.forEach((file) => {
      newPreviewUrls.push(URL.createObjectURL(file));
    });
    
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeFile = (index: number): void => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    
    // Revoke the preview URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!session?.user || !content.trim()) return;
    
    setIsSubmitting(true);
    
    // In a real app, you would upload files to Bunny CDN or similar
    // This is a simplified example
    const mediaUrls: string[] = [];
    const mediaTitles: string[] = [];
    const mediaTypes: string[] = [];
    
    // In a real implementation, upload files and get URLs back
    selectedFiles.forEach((file) => {
      // Mock URLs for demo purposes
      mediaUrls.push(URL.createObjectURL(file));
      mediaTitles.push(file.name);
      mediaTypes.push(file.type);
    });
    
    const postData: PostCreateInput = {
      content,
      mediaUrls,
      mediaTitles,
      mediaTypes,
      privacyLevel: "PUBLIC", // Default to public
    };
    
    createPost.mutate(postData);
  };

  const handleAnalyze = (): void => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    const topic = content.split(" ").slice(0, 3).join(" "); // Use first few words as topic
    analyzeContent.mutate({ topic });
  };

  if (!session?.user) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow">
        <p className="text-center">Please sign in to create a post</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] w-full resize-none rounded-lg border-none bg-transparent p-2 outline-none"
          disabled={isSubmitting}
        />
        
        {/* File preview */}
        {previewUrls.length > 0 && (
          <div className="mb-4 mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg bg-muted">
                {selectedFiles[index].type.startsWith("image/") ? (
                  <img
                    src={url}
                    alt={selectedFiles[index].name}
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : selectedFiles[index].type.startsWith("video/") ? (
                  <video
                    src={url}
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-sm">{selectedFiles[index].name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center rounded-full p-2 hover:bg-muted"
              disabled={isSubmitting}
            >
              <ImageIcon className="h-5 w-5" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*"
                multiple
                disabled={isSubmitting}
              />
            </button>
            <button
              type="button"
              className="flex items-center rounded-full p-2 hover:bg-muted"
              disabled={isSubmitting}
            >
              <Smile className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleAnalyze}
              className="flex items-center rounded-full p-2 hover:bg-muted"
              disabled={isSubmitting || isAnalyzing || !content.trim()}
            >
              <Sparkles className="h-5 w-5" />
            </button>
          </div>
          
          <button
            type="submit"
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}