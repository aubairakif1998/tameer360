"use client";

import { BrickWall } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface AppLoadingScreenProps {
  title: string;
  description?: string;
}

export function AppLoadingScreen({
  title,
  description,
}: AppLoadingScreenProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BrickWall className="size-7" aria-hidden />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Spinner className="size-5 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          </div>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        {/* <div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary/60" />
        </div> */}
      </div>
    </div>
  );
}
