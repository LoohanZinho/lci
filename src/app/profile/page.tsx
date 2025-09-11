"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, FormEvent, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { user, logout, updateUserProfile } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);
  
  if (!user) {
    return null;
  }
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);
    try {
        await updateUserProfile(displayName);
        setSuccessMessage("Nome atualizado com sucesso!");
    } catch (err) {
        setError("Ocorreu um erro ao atualizar o nome. Tente novamente.");
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }

  const handleBecomeAnonymous = async () => {
    setError("");
    setSuccessMessage("");
    if(!window.confirm("Tem certeza que deseja remover seu nome e se tornar anônimo?")) {
        return;
    }
    setIsLoading(true);
    try {
        await updateUserProfile("");
        setDisplayName("");
        setSuccessMessage("Seu perfil agora é anônimo.");
    } catch (err) {
        setError("Ocorreu um erro. Tente novamente.");
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary/50">
        <header className="flex items-center justify-between p-4 border-b bg-background">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">
                Meu Perfil
            </h1>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
        </header>

        <main className="p-4 md:p-8">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>{user.displayName || "Usuário Anônimo"}</CardTitle>
                        <CardDescription>Gerencie suas informações e preferências.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="displayName">Nome de Exibição</Label>
                                <Input
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Seu nome"
                                    disabled={isLoading}
                                />
                            </div>
                             <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <p id="email" className="font-semibold text-muted-foreground">{user.email}</p>
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                               {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </form>
                         <div className="space-y-4">
                            <Button variant="outline" className="w-full" onClick={handleBecomeAnonymous} disabled={isLoading}>
                                Tornar Anônimo
                            </Button>
                            <Button variant="destructive" className="w-full" onClick={logout}>
                                Sair da Conta
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
