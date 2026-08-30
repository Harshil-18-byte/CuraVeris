"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || (user && user.role !== "admin")) {
    return null;
  }

  return <>{children}</>;
}
