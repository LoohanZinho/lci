"use client";

import { InfluencerForm } from "@/components/influencer-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { BookUser } from "lucide-react";

export default function HomePage() {
  const { user, logout } = useAuth();

  // O hook useAuth já redireciona se não houver usuário,
  // mas podemos renderizar null ou um loader enquanto o estado de auth carrega.
  if (!user) {
    return null; 
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <BookUser className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">
            <span className="font-light">LCI:</span> Mural de Influência
          </h1>
        </div>
        <Button onClick={logout} variant="ghost">Sair</Button>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <InfluencerForm />
        </div>
      </main>
    </div>
  );
}
