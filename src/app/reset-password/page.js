"use client";

import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";
import Spinner from "@/components/Spinner";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <Spinner />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
