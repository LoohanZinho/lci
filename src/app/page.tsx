"use client";

import { InfluencerForm } from "@/components/influencer-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, Sun, Moon, Search, User as UserIcon, LogOut } from "lucide-react";
import { InfluencerTable } from "@/components/influencer-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { getInfluencers, InfluencerWithUserData } from "@/lib/influencers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";


export default function HomePage() {
  const { user, logout } = useAuth();
  const [greeting, setGreeting] = useState("Olá");
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const [influencers, setInfluencers] = useState<InfluencerWithUserData[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState<"lastUpdate" | "followers">("lastUpdate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    setLoading(true);
    const unsubscribe = getInfluencers(
      (data) => {
        setInfluencers(data);
        setLoading(false);
      },
      sortBy,
      sortDirection
    );
    return () => unsubscribe();
  }, [sortBy, sortDirection]);

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
  
  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setPopoverOpen(false);
  };
  
  const filteredInfluencers = useMemo(() => {
    if (!searchQuery) {
      return influencers;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return influencers.filter(
      (influencer) =>
        influencer.name.toLowerCase().includes(lowercasedQuery) ||
        influencer.instagram.toLowerCase().includes(lowercasedQuery) ||
        (influencer.notes &&
          influencer.notes.toLowerCase().includes(lowercasedQuery)) ||
        (influencer.status &&
          influencer.status.toLowerCase().includes(lowercasedQuery))
    );
  }, [influencers, searchQuery]);


  if (!user) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex flex-col min-h-screen">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-8 h-8 bg-primary/20 text-primary"
              >
                {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold">
                {greeting}, <span className="text-primary">{user.displayName || user.email}!</span>
              </h2>
              <p className="text-muted-foreground">
                Encontre, gerencie e adicione novos influenciadores ao seu mural.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <div className="relative w-full flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por nome, @, ou nota..."
                      className="pl-9 w-full"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if(e.target.value.length > 0){
                          setPopoverOpen(true);
                        } else {
                          setPopoverOpen(false);
                        }
                      }}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Digite para buscar..." />
                    <CommandList>
                      <CommandEmpty>Nenhum resultado.</CommandEmpty>
                      <CommandGroup>
                        {influencers
                          .filter(
                            (i) =>
                              i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              i.instagram.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .slice(0, 5)
                          .map((influencer) => (
                            <CommandItem
                              key={influencer.id}
                              onSelect={() => handleSelectSuggestion(influencer.name)}
                              value={influencer.name}
                            >
                              {influencer.name} ({influencer.instagram})
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                <div className="flex-1">
                  <Label htmlFor="sort-by" className="text-xs text-muted-foreground">Ordenar por</Label>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as "lastUpdate" | "followers")}>
                    <SelectTrigger id="sort-by" className="w-full md:w-[150px]">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lastUpdate">Última Edição</SelectItem>
                      <SelectItem value="followers">Seguidores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                   <Label htmlFor="sort-direction" className="text-xs text-muted-foreground">Direção</Label>
                  <Select value={sortDirection} onValueChange={(v) => setSortDirection(v as "asc" | "desc")}>
                    <SelectTrigger id="sort-direction" className="w-full md:w-[140px]">
                      <SelectValue placeholder="Direção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Decrescente</SelectItem>
                      <SelectItem value="asc">Crescente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>


              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto mt-2 md:mt-0 shrink-0">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Postagem
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Influenciador</DialogTitle>
                  </DialogHeader>
                  <InfluencerForm onFinished={() => setIsFormOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

          <InfluencerTable influencers={filteredInfluencers} loading={loading} />
        </div>
      </main>
    </div>
  );
}
