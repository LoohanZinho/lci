"use client";

import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

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
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
            <Image
                src="https://i.imgur.com/DkRNtRL.png"
                alt="LCI: Mural de Influência Logo"
                width={250}
                height={76}
                priority
            />
        </div>
        <p className="text-sm text-muted-foreground">
          Lucrando com Influenciadores
        </p>
      </div>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
