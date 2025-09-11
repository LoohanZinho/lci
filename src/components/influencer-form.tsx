"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addInfluencer, NewInfluencer } from "@/lib/influencers";
import { useAuth } from "@/hooks/use-auth";
import { useState, FormEvent } from "react";
import { DialogClose } from "@radix-ui/react-dialog";

export function InfluencerForm() {
  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [followers, setFollowers] = useState("");
  const [status, setStatus] = useState("Disponível");
  const [niche, setNiche] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
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
      status,
      niche,
      contact,
      notes,
      isFumo: false,
      lastUpdate: new Date(),
      addedBy: user.uid,
    };

    try {
      await addInfluencer(newInfluencer);
      // Reset form
      setName("");
      setInstagram("");
      setFollowers("");
      setStatus("Disponível");
      setNiche("");
      setContact("");
      setNotes("");
      setError(null);
      // Close dialog
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
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="niche">Nicho/Segmento</Label>
            <Input
              id="niche"
              placeholder="Ex: Fitness, Moda"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Disponível">Disponível</SelectItem>
                <SelectItem value="Em negociação">Em negociação</SelectItem>
                <SelectItem value="Fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="flex flex-col space-y-1.5">
            <Label htmlFor="contact">Contato Preferencial (opcional)</Label>
            <Input
              id="contact"
              placeholder="Email ou WhatsApp"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Responde rápido, cobra valor fixo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
