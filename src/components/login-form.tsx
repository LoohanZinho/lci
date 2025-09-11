"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export function LoginForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acessar Plataforma</CardTitle>
        <CardDescription>
          Faça login para continuar no mural de influenciadores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Sua senha" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        <Button>Entrar</Button>
        <div className="text-center text-sm">
          Não tem uma conta?{" "}
          <Link href="/signup" className="underline">
            Cadastre-se
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
