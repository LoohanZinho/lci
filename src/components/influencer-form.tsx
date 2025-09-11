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

const initialState = {
  name: "",
  instagram: "",
  followers: "",
  status: "Disponível",
  niche: "",
  contact: "",
  notes: "",
  isFumo: false,
};

const formatFollowers = (value: string) => {
    if (!value) return "";
    const cleanedValue = value.replace(/\D/g, "");
    if (cleanedValue === "") return "";
    return new Intl.NumberFormat('pt-BR').format(parseInt(cleanedValue, 10));
}

const unformatFollowers = (value: string) => {
    if (!value) return "";
    return value.replace(/\D/g, "");
}

export function InfluencerForm({ influencer, onFinished }: InfluencerFormProps) {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const isEditMode = !!influencer;

  useEffect(() => {
    if (influencer) {
      setFormData({
        name: influencer.name,
        instagram: influencer.instagram.startsWith('@') ? influencer.instagram.substring(1) : influencer.instagram,
        followers: formatFollowers(influencer.followers.toString()),
        status: influencer.status,
        niche: influencer.niche,
        contact: influencer.contact,
        notes: influencer.notes,
        isFumo: influencer.isFumo,
      });
    } else {
      setFormData(initialState);
    }
  }, [influencer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({...prev, [id]: checked}));
    } else if (id === 'followers') {
        setFormData(prev => ({...prev, followers: formatFollowers(value)}));
    } else {
        setFormData(prev => ({...prev, [id]: value}));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({...prev, status: value}));
  }

  const handleCancel = () => {
    if (onFinished) {
      onFinished();
    }
  }


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Você precisa estar logado para realizar esta ação.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const influencerData = {
      name: formData.name,
      instagram: formData.instagram.startsWith('@') ? formData.instagram : `@${formData.instagram}`,
      followers: parseInt(unformatFollowers(formData.followers), 10),
      status: formData.status,
      niche: formData.niche,
      contact: formData.contact,
      notes: formData.notes,
      isFumo: formData.isFumo,
    };

    try {
      if (isEditMode && influencer) {
        await updateInfluencer(influencer.id, influencerData);
      } else {
        const newInfluencer: NewInfluencer = {
          ...influencerData,
          lastUpdate: new Date(),
          addedBy: user.uid,
        };
        await addInfluencer(newInfluencer);
        setFormData(initialState); // Reset form after adding
      }
      
      if (onFinished) {
        onFinished();
      }

    } catch (err) {
      console.error(err);
      setError(`Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} influenciador. Tente novamente.`);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="py-4 max-h-[70vh] overflow-y-auto px-1 pr-4">
      <form onSubmit={handleSubmit}>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Nome do Influenciador</Label>
            <Input
              id="name"
              placeholder="Ex: Maria Souza"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="instagram">Instagram</Label>
            <div className="flex h-10 w-full items-center rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <span className="text-muted-foreground">@</span>
              <Input
                id="instagram"
                placeholder="username"
                value={formData.instagram.replace(/@/g, '')}
                onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value.replace(/@/g, '')}))}
                required
                className="border-0 bg-transparent p-0 pl-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="followers">Seguidores</Label>
            <Input
              id="followers"
              type="text"
              inputMode="numeric"
              placeholder="Ex: 150.000"
              value={formData.followers}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="niche">Nicho/Segmento</Label>
            <Input
              id="niche"
              placeholder="Ex: Fitness, Moda"
              value={formData.niche}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={handleSelectChange} disabled={isLoading}>
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
              value={formData.contact}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Responde rápido, cobra valor fixo..."
              value={formData.notes}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
           <div className="flex items-center space-x-2">
             <input
              type="checkbox"
              id="isFumo"
              checked={formData.isFumo}
              onChange={handleChange}
              className="h-4 w-4"
              disabled={isLoading}
            />
            <Label htmlFor="isFumo" className="cursor-pointer">Marcar como "Fumo" (Não deu ROI)</Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex justify-end space-x-2 pt-6">
           <Button type="button" variant="ghost" onClick={handleCancel} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (isEditMode ? 'Salvando...' : 'Adicionando...') : (isEditMode ? 'Salvar Alterações' : 'Adicionar')}
          </Button>
        </div>
      </form>
    </div>
  );
}
