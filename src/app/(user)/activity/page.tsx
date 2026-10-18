"use client";

import { Suspense } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { ActivityDetailContent } from "@/features/activity";

export default function ActivityPage() {
  return (
    <Suspense
      fallback={
        <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: "40vh" }}>
          <IconLoader2 className="animate-spin text-primary" size={36} />
        </div>
      }
    >
      <ActivityDetailContent />
    </Suspense>
  );
}
