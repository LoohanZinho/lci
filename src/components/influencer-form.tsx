"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InfluencerForm() {
  return (
    <div className="py-4">
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
      <div className="flex justify-end space-x-2 pt-6">
        <Button variant="ghost">Cancelar</Button>
        <Button>Adicionar</Button>
      </div>
    </div>
  );
}
