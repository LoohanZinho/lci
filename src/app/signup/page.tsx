"use client";

import { SignupForm } from "@/components/signup-form";
import { BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignupPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="font-light">LCI:</span> Mural de Influência
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Lucrando com Influenciadores
        </p>
      </div>
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}
