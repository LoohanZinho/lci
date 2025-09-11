"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addInfluencer, NewInfluencer } from "@/lib/influencers";
import { useAuth } from "@/hooks/use-auth";
import { useState, FormEvent } from "react";
import { DialogClose } from "@radix-ui/react-dialog";

export function InfluencerForm() {
  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [followers, setFollowers] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Você precisa estar logado para adicionar um influenciador.");
      return;
    }

    const newInfluencer: NewInfluencer = {
      name,
      instagram,
      followers: parseInt(followers, 10),
      status: "Disponível",
      isFumo: false,
      lastUpdate: new Date(),
      addedBy: user.uid,
    };

    try {
      await addInfluencer(newInfluencer);
      // Reset form or close dialog
      setName("");
      setInstagram("");
      setFollowers("");
      setError(null);
      // NOTE: This is a bit of a hack to close the dialog. A better
      // way would be to control the dialog's open state from the parent.
      document.getElementById('close-dialog')?.click();
    } catch (err) {
      console.error(err);
      setError("Falha ao adicionar influenciador. Tente novamente.");
    }
  };

  return (
    <div className="py-4">
      <form onSubmit={handleSubmit}>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Nome do Influenciador</Label>
            <Input
              id="name"
              placeholder="Ex: Maria Souza"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              placeholder="@username"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="followers">Seguidores</Label>
            <Input
              id="followers"
              type="number"
              placeholder="Ex: 150000"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex justify-end space-x-2 pt-6">
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button type="submit">Adicionar</Button>
        </div>
      </form>
       <DialogClose id="close-dialog" className="hidden" />
    </div>
  );
}
