"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  if (!user) {
    return null;
  }
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

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
                        <CardTitle>{user.displayName || "Usuário"}</CardTitle>
                        <CardDescription>Gerencie suas informações e preferências.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col space-y-1.5">
                            <span className="text-sm font-medium text-muted-foreground">Nome</span>
                            <p className="font-semibold">{user.displayName}</p>
                        </div>
                         <div className="flex flex-col space-y-1.5">
                            <span className="text-sm font-medium text-muted-foreground">Email</span>
                            <p className="font-semibold">{user.email}</p>
                        </div>
                        <Button variant="outline" className="w-full" onClick={logout}>
                            Sair da Conta
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
