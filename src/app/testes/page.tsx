
"use client";

import { useState, useTransition, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInstagramProfilePic } from "@/app/actions";
import Image from "next/image";
import { UserCircle, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TestesPage() {
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFetchProfilePic = (e: FormEvent) => {
    e.preventDefault();
    if (username) {
      startTransition(async () => {
        setError(null);
        setProfilePic(null);
        const result = await getInstagramProfilePic(username);
        if (result.profilePicUrl) {
          setProfilePic(result.profilePicUrl);
        } else {
          setError(result.error || "Ocorreu um erro desconhecido.");
          setProfilePic(null);
        }
      });
    } else {
      setProfilePic(null);
      setError("Por favor, insira um nome de usuário.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Página de Testes</h1>
      <p className="mb-6">Busque por um perfil do Instagram e veja a foto.</p>
      
      <form onSubmit={handleFetchProfilePic} className="max-w-sm space-y-4">
        <div>
            <Label htmlFor="instagram-test">Instagram</Label>
            <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input 
                    id="instagram-test" 
                    placeholder="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value.replace(/@/g, ''))} 
                    className="pl-7" 
                />
            </div>
        </div>
        
        <Button type="submit" disabled={isPending || !username} className="w-full">
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Puxando...
                </>
            ) : (
                "Puxar foto de perfil"
            )}
        </Button>

        <div className="mt-4 flex items-center justify-center w-full h-48 bg-muted/50 rounded-lg border-2 border-dashed">
            {isPending && <Loader2 className="h-8 w-8 text-primary animate-spin" />}

            {!isPending && error && (
                <div className="text-center text-destructive px-4">
                    <p className="font-semibold">Oops!</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {!isPending && profilePic && (
                <Image
                    src={profilePic}
                    alt={`Foto de perfil de @${username}`}
                    width={150}
                    height={150}
                    className="rounded-full object-cover border-4 border-background shadow-md"
                />
            )}
            
            {!isPending && !profilePic && !error && (
                <div className="text-center text-muted-foreground">
                    <Search className="h-10 w-10 mx-auto mb-2"/>
                    <p>Digite um nome de usuário para buscar.</p>
                </div>
            )}
        </div>
      </form>
    </div>
  );
}
