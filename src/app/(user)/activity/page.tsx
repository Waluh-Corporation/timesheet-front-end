import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ActivityDetailContent } from "./components/ActivityDetailContent";

export default function ActivityPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-mr-purple" />
        </div>
      }
    >
      <ActivityDetailContent />
    </Suspense>
  );
}
