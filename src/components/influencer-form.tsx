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

export function InfluencerForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Novo Influenciador</CardTitle>
        <CardDescription>
          Preencha os dados para registrar um novo influenciador.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Nome do Influenciador</Label>
              <Input id="name" placeholder="Ex: Maria Souza" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" placeholder="@username" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="followers">Seguidores</Label>
              <Input
                id="followers"
                type="number"
                placeholder="Ex: 150000"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="ghost">Cancelar</Button>
        <Button>Adicionar Influenciador</Button>
      </CardFooter>
    </Card>
  );
}
