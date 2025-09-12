"use client";

import { LoginForm } from "@/components/login-form";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Always use the light-text logo for better contrast and consistency
  const logoSrc = "https://i.imgur.com/DkRNtRL.png";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4 h-[76px]">
          {mounted && (
            <Image
                src={logoSrc}
                alt="LCI: Mural de Influência Logo"
                width={250}
                height={76}
                priority
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Mural dos influenciadores
        </p>
      </div>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
