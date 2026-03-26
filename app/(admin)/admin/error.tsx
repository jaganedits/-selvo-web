"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-7 text-destructive" />
      </div>
      <h2 className="text-lg font-heading font-semibold">Admin Error</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Something went wrong in the admin panel. Please try again.
      </p>
      <Button variant="outline" onClick={reset}>
        <RotateCcw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
