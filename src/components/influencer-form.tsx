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
import { addInfluencer, NewInfluencer, Influencer, updateInfluencer } from "@/lib/influencers";
import { useAuth } from "@/hooks/use-auth";
import { useState, FormEvent, useEffect } from "react";

interface InfluencerFormProps {
  influencer?: Influencer;
  onFinished?: () => void;
}

export function InfluencerForm({ influencer, onFinished }: InfluencerFormProps) {
  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [followers, setFollowers] = useState("");
  const [status, setStatus] = useState("Disponível");
  const [niche, setNiche] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [isFumo, setIsFumo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const isEditMode = !!influencer;

  useEffect(() => {
    if (influencer) {
      setName(influencer.name);
      setInstagram(influencer.instagram.startsWith('@') ? influencer.instagram.substring(1) : influencer.instagram);
      setFollowers(influencer.followers.toString());
      setStatus(influencer.status);
      setNiche(influencer.niche);
      setContact(influencer.contact);
      setNotes(influencer.notes);
      setIsFumo(influencer.isFumo);
    }
  }, [influencer]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Você precisa estar logado para realizar esta ação.");
      return;
    }

    const influencerData = {
      name,
      instagram: instagram.startsWith('@') ? instagram : `@${instagram}`,
      followers: parseInt(followers, 10),
      status,
      niche,
      contact,
      notes,
      isFumo,
    };

    try {
      if (isEditMode) {
        await updateInfluencer(influencer.id, influencerData);
      } else {
        const newInfluencer: NewInfluencer = {
          ...influencerData,
          lastUpdate: new Date(),
          addedBy: user.uid,
        };
        await addInfluencer(newInfluencer);
      }
      
      if (onFinished) {
        onFinished();
      }

    } catch (err) {
      console.error(err);
      setError(`Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} influenciador. Tente novamente.`);
    }
  };

  return (
    <div className="py-4 max-h-[70vh] overflow-y-auto px-1">
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
            <div className="flex h-10 w-full items-center rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <span className="text-muted-foreground">@</span>
              <Input
                id="instagram"
                placeholder="username"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.replace(/@/g, ''))}
                required
                className="border-0 bg-transparent p-0 pl-1 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
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
           <div className="flex items-center space-x-2">
             <input
              type="checkbox"
              id="isFumo"
              checked={isFumo}
              onChange={(e) => setIsFumo(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="isFumo">Marcar como "Fumo" (Não deu ROI)</Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex justify-end space-x-2 pt-6">
           <Button type="button" variant="ghost" onClick={onFinished}>Cancelar</Button>
          <Button type="submit">{isEditMode ? 'Salvar Alterações' : 'Adicionar'}</Button>
        </div>
      </form>
    </div>
  );
}
