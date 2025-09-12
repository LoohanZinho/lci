"use client";

import { SignupForm } from "@/components/signup-form";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function SignupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

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
                src={theme === 'dark' ? "https://i.imgur.com/DkRNtRL.png" : "https://i.imgur.com/uYwvJ7Q.png"}
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
        <SignupForm />
      </div>
    </div>
  );
}
