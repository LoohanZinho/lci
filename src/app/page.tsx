"use client";

import { InfluencerForm } from "@/components/influencer-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { BookUser, PlusCircle, Search } from "lucide-react";
import { InfluencerTable } from "@/components/influencer-table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function HomePage() {
  const { user, logout } = useAuth();

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
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Olá, {user.displayName || user.email}
          </span>
          <Button onClick={logout} variant="ghost">Sair</Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou @" className="pl-9" />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Influenciador
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

          <InfluencerTable />
        </div>
      </main>
    </div>
  );
}
