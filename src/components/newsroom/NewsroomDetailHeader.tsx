"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function NewsroomDetailHeader() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/newsroom");
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2 px-0 hover:bg-transparent hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Link
          href="/insights/explore" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "auto" })}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Explore Insights
        </Link>
      </div>
    </div>
  );
}
