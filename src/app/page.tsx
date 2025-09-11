"use client";

import { InfluencerForm } from "@/components/influencer-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Filter, PlusCircle, Sun, Moon, Search } from "lucide-react";
import { InfluencerTable } from "@/components/influencer-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  const { user, logout } = useAuth();
  const [greeting, setGreeting] = useState("Olá");
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();

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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary/50">
      <header className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold text-primary">
            Lucrando com Influenciadores
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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
                Encontre, gerencie e adicione novos influenciadores ao seu mural.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, @, ou nota..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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

          <InfluencerTable searchQuery={searchQuery} />
        </div>
      </main>
    </div>
  );
}
