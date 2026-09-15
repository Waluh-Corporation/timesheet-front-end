import Link from "next/link";
import { Lock, ChevronRight } from "lucide-react";

export function PasswordSection() {
  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lock size={18} className="text-mr-purple" />
          <h2 className="text-lg font-bold">Password & Authentication</h2>
        </div>
        <div className="flex gap-2">
          <Link href="/change-password" className="btn-primary text-sm flex items-center gap-1">
            Change Password <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
