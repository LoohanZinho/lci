"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const { logout, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        // The AuthProvider will handle redirecting to /login
      } catch (error) {
        console.error("Failed to log out", error);
        // If logout fails, redirect to home
        router.push("/");
      }
    };

    // Only attempt logout if the user is still logged in
    if (user) {
      performLogout();
    } else {
        // If user is already null, just redirect to login
        router.push('/login');
    }
  }, [logout, router, user]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="mt-4 text-lg text-muted-foreground">Deslogando...</p>
    </div>
  );
}

    