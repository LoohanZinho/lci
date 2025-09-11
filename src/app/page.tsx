"use client";

import { InfluencerForm } from "@/components/influencer-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, Filter, PlusCircle, Sun } from "lucide-react";
import { InfluencerTable } from "@/components/influencer-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { user, logout } = useAuth();
  const [greeting, setGreeting] = useState("Olá");

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        return "Bom dia";
      } else if (hour >= 12 && hour < 18) {
        return "Boa tarde";
      } else {
        return "Boa noite";
      }
    };
    setGreeting(getGreeting());
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <header className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold text-primary">
            Lucrando com Influenciadores
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Sun className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8 bg-primary/20 text-primary"
            onClick={logout}
          >
           {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold">
                {greeting}, <span className="text-primary">{user.displayName || user.email}!</span>
              </h2>
              <p className="text-muted-foreground">
                Visão geral do desempenho de suas campanhas.
              </p>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Este Mês
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Postagem
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Influenciador</DialogTitle>
                  </DialogHeader>
                  <InfluencerForm />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <InfluencerTable />
        </div>
      </main>
    </div>
  );
}
