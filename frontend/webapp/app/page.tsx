import Link from "next/link";
import { BrickWall, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white px-6 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-lg">
          <BrickWall className="size-8" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Tameer360
        </h1>
        <p className="mt-2 text-lg text-amber-700 dark:text-amber-400">
          Construction Material Supply ERP
        </p>
        <p className="mt-4 text-muted-foreground">
          White-label platform for brick kilns, sand suppliers, crush plants,
          and construction material traders across Pakistan.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Bhatta Owner Login
            <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/login" />}
          >
            Platform Admin
          </Button>
        </div>

        <p className="mt-12 text-xs text-muted-foreground">
          Production • Stock • Dispatch • Recovery
        </p>
      </div>
    </div>
  );
}
