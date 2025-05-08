import { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication Error | DapDip",
  description: "There was an error during authentication",
};

export default function AuthError({
  searchParams,
}: {
  searchParams: { error?: string };
}): JSX.Element {
  const error = searchParams.error || "Unknown authentication error";

  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification link may have expired or was already used.",
    OAuthSignin: "Error while trying to sign in with the provider.",
    OAuthCallback: "Error while handling the sign in callback.",
    OAuthCreateAccount: "Could not create an account with the provider.",
    EmailCreateAccount: "Could not create an account with the provided email.",
    Callback: "Error during the callback process.",
    OAuthAccountNotLinked: "This email is already associated with another account.",
    EmailSignin: "The email could not be sent.",
    CredentialsSignin: "The login details you provided were incorrect.",
    SessionRequired: "You must be signed in to access this page.",
    Default: "An unknown error occurred during authentication.",
  };

  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Authentication Error
          </h1>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
        <div className="grid gap-4">
          <Link
            href="/auth/signin"
            className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-center text-sm font-medium hover:bg-muted"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}