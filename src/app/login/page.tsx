"use client";

import { LoginForm } from "@/components/login-form";
import { BookUser } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="flex items-center space-x-2 mb-8">
        <BookUser className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">
          <span className="font-light">LCI:</span> Mural de Influência
        </h1>
      </div>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
