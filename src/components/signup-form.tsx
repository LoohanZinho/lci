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

export function SignupForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Conta</CardTitle>
        <CardDescription>
          Cadastre-se para ter acesso ao mural de influenciadores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Seu nome completo" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Crie uma senha forte" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="confirm-password">Repetir Senha</Label>
              <Input id="confirm-password" type="password" placeholder="Repita sua senha" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        <Button>Cadastrar</Button>
        <div className="text-center text-sm">
          Já tem uma conta?{" "}
          <Link href="/login" className="underline">
            Faça login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
