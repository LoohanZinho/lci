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
import { Switch } from "@/components/ui/switch";

export default function ProfilePage() {
  const { user, logout, updateUserProfile } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  // State for the form input
  const [displayName, setDisplayName] = useState("");
  // State for the switch
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  // This effect syncs the form state with the auth user state from the provider
  useEffect(() => {
    if (user) {
      const currentName = user.displayName || "";
      setDisplayName(currentName);
      // A user is anonymous if they don't have a display name in their profile
      setIsAnonymous(!currentName); 
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
      // The name to save is determined by the switch state.
      // If anonymous, we save an empty string. Otherwise, we save the input's value.
      const nameToSave = isAnonymous ? "" : displayName;
      
      // We only call the update if the name has actually changed from what's currently in the profile.
      if (nameToSave !== (user.displayName || "")) {
        await updateUserProfile(nameToSave);
      }
      
      setSuccessMessage("Preferências salvas com sucesso!");
    } catch (err) {
      setError("Ocorreu um erro ao salvar as preferências. Tente novamente.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  // This handler just toggles the switch state. It doesn't save anything.
  const handleAnonymousToggle = (checked: boolean) => {
    setIsAnonymous(checked);
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
                        {/* The title always shows the currently saved user name */}
                        <CardTitle>{user.displayName || "Usuário Anônimo"}</CardTitle>
                        <CardDescription>Gerencie suas informações e preferências.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="displayName">Nome de Exibição</Label>
                                <Input
                                    id="displayName"
                                    value={displayName} // Input value is controlled by component state
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Seu nome"
                                    disabled={isLoading || isAnonymous}
                                />
                            </div>
                             <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <p id="email" className="text-sm font-medium text-muted-foreground pt-2">{user.email}</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                               <div className="space-y-0.5">
                                 <Label htmlFor="anonymous-mode">Modo Anônimo</Label>
                                 <p className="text-xs text-muted-foreground">
                                    Seu nome não será exibido nas postagens.
                                 </p>
                               </div>
                               <Switch
                                id="anonymous-mode"
                                checked={isAnonymous}
                                onCheckedChange={handleAnonymousToggle}
                                disabled={isLoading}
                               />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                               {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </form>
                         <div className="space-y-4">
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
