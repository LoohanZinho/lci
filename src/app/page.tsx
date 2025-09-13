
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
import Image from "next/image";


export default function HomePage() {
  const { user, isAdmin } = useAuth();
  const [greeting, setGreeting] = useState("Olá");
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const [influencers, setInfluencers] = useState<InfluencerWithUserData[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [sortBy, setSortBy] = useState<"lastUpdate" | "followers">("lastUpdate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    setMounted(true);
  }, []);

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
  
  const filteredInfluencers = useMemo(() => {
    let tempInfluencers = influencers;

    // Filter based on status and special "Contrato fechado" logic
    tempInfluencers = tempInfluencers.filter(influencer => {
      // Rule: "Contrato fechado" is only visible to the user who added it or admins.
      if (influencer.status === "Contrato fechado") {
        const isOwner = user?.uid === influencer.addedBy;
        return isOwner || isAdmin;
      }

      // Rule: Default view hides "Contrato fechado".
      if (statusFilter === "all") {
        return true; // Already handled above, keep others
      }
      
      // Rule: Filter by selected status.
      return influencer.status === statusFilter;
    });

    // Then, filter by search query
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        tempInfluencers = tempInfluencers.filter((influencer) => {
            const nameMatch = influencer.name.toLowerCase().includes(lowercasedQuery);
            
            // If status is 'Contrato fechado', only search by name is allowed
            if (influencer.status === "Contrato fechado") {
                return nameMatch;
            }

            // For other statuses, search by name, instagram, or notes
            const instagramMatch = influencer.instagram.toLowerCase().includes(lowercasedQuery);
            const notesMatch = influencer.notes && influencer.notes.toLowerCase().includes(lowercasedQuery);
            
            return nameMatch || instagramMatch || notesMatch;
        });
    }

    return tempInfluencers;
  }, [influencers, searchQuery, statusFilter, user, isAdmin]);

  const totalPages = Math.ceil(filteredInfluencers.length / itemsPerPage);

  const paginatedInfluencers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredInfluencers.slice(startIndex, endIndex);
  }, [filteredInfluencers, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage === 0 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredInfluencers, totalPages, currentPage]);


  if (!user) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const logoSrc = theme === 'dark' ? "https://i.imgur.com/DkRNtRL.png" : "https://i.imgur.com/uYwvJ7Q.png";

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center space-x-3 h-[36px]">
          {mounted && (
            <Image
                src={logoSrc}
                alt="LCI: Mural de Influência Logo"
                width={120}
                height={36}
                priority
            />
          )}
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
              <DropdownMenuItem asChild>
                <Link href="/logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {greeting}, <span className="text-primary">{user.displayName || user.email}</span>
              </h2>
              <p className="text-muted-foreground">
                Encontre, gerencie e adicione novos influenciadores ao seu mural.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 mb-4">
            <div className="w-full">
               <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Buscar por nome, @, ou nota..."
                        className="pl-9 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 w-full">
                <div className="overflow-x-auto pb-2 md:pb-0">
                    <div className="flex flex-row md:flex-wrap gap-2">
                        <div className="shrink-0 basis-auto">
                          <Label htmlFor="sort-by" className="text-xs text-muted-foreground">Ordenar por</Label>
                          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "lastUpdate" | "followers")}>
                            <SelectTrigger id="sort-by" className="w-full min-w-[150px]">
                              <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lastUpdate">Última Edição</SelectItem>
                              <SelectItem value="followers">Seguidores</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="shrink-0 basis-auto">
                          <Label htmlFor="sort-direction" className="text-xs text-muted-foreground">Ordem</Label>
                          <Select value={sortDirection} onValueChange={(v) => setSortDirection(v as "asc" | "desc")}>
                            <SelectTrigger id="sort-direction" className="w-full min-w-[150px]">
                              <SelectValue placeholder="Ordem" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="desc">Decrescente</SelectItem>
                              <SelectItem value="asc">Crescente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="shrink-0 basis-auto">
                          <Label htmlFor="status-filter" className="text-xs text-muted-foreground">Filtrar por Status</Label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger id="status-filter" className="w-full min-w-[150px]">
                              <SelectValue placeholder="Filtrar por status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos os Status</SelectItem>
                              <SelectItem value="Publicidade Agendada">Publicidade Agendada</SelectItem>
                              <SelectItem value="Deu prejuízo">Deu prejuízo</SelectItem>
                              <SelectItem value="Deixou de dar lucro">Deixou de dar lucro</SelectItem>
                              <SelectItem value="Golpista">Golpista</SelectItem>
                              <SelectItem value="Desconhecido">Desconhecido</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                    </div>
                </div>

              <div className="w-full md:w-auto">
                  <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                       <div className="relative group w-full md:w-auto">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#fbda25] to-[#a98900] rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                          <Button className="relative shrink-0 w-full md:w-auto bg-gradient-to-r from-[#fbda25] to-[#a98900] text-black">
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Nova Postagem
                          </Button>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Novo Influenciador</DialogTitle>
                      </DialogHeader>
                      <InfluencerForm onFinished={() => setIsFormOpen(false)} />
                    </DialogContent>
                  </Dialog>
              </div>
            </div>
          </div>

          <InfluencerTable influencers={paginatedInfluencers} loading={loading} />
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
