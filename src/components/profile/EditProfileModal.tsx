"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { User } from "@prisma/client";

import { api } from "@/lib/trpc/client";
import { userProfileSchema } from "@/lib/validations/user";
import type { UserProfileInput } from "@/lib/validations/user";

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
}

export default function EditProfileModal({
  user,
  onClose,
}: EditProfileModalProps): JSX.Element {
  const [form, setForm] = useState<UserProfileInput>({
    name: user.name || "",
    username: user.username || "",
    bio: user.bio || "",
  });
  
  const utils = api.useUtils();
  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.getById.invalidate({ userId: user.id });
      utils.user.getProfile.invalidate();
      toast.success("Profile updated successfully");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    try {
      // Validate the form data
      const validData = userProfileSchema.parse(form);
      
      // Submit the form
      updateProfileMutation.mutate(validData);
    } catch (error: any) {
      // Handle validation errors
      if (error.errors) {
        const firstError = error.errors[0];
        toast.error(firstError.message || "Invalid form data");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div 
        className="relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label 
              htmlFor="name" 
              className="text-sm font-medium"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="username" 
              className="text-sm font-medium"
            >
              Username
            </label>
            <div className="flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm">
              <span className="text-muted-foreground">@</span>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                className="w-full border-0 bg-transparent pl-1 focus-visible:outline-none"
                placeholder="username"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Only letters, numbers, and underscores. No spaces.
            </p>
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="bio" 
              className="text-sm font-medium"
            >
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Tell us about yourself"
            />
            <p className="text-xs text-muted-foreground">
              {form.bio ? form.bio.length : 0}/500 characters
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
              disabled={updateProfileMutation.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              disabled={updateProfileMutation.isLoading}
            >
              {updateProfileMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}