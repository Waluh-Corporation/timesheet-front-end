import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth";
import { IconLoader2 } from "@tabler/icons-react";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="page page-center min-vh-100 d-flex align-items-center justify-content-center">
          <IconLoader2 className="animate-spin text-primary" size={32} />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
