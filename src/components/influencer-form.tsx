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
import { useState, FormEvent, useEffect, useRef } from "react";
import { uploadProofImage } from "@/lib/storage";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Image as ImageIcon, X } from "lucide-react";
import Image from 'next/image';

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
  proofImageUrl: "",
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        proofImageUrl: influencer.proofImageUrl || "",
      });
      if (influencer.proofImageUrl) {
        setImagePreview(influencer.proofImageUrl);
      }
    } else {
      setFormData(initialState);
    }
  }, [influencer]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("A imagem não pode ter mais de 5MB.");
        return;
      }
      setError(null);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    // In edit mode, this will mark the image for deletion on submit
    setFormData(prev => ({...prev, proofImageUrl: "" }));
  }

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
    setUploadProgress(null);

    let finalImageUrl = influencer?.proofImageUrl || "";

    try {
        if (imageFile) {
            const onProgress = (progress: number) => {
                setUploadProgress(progress);
            };
            const influencerIdForPath = influencer?.id || user.uid + Date.now();
            finalImageUrl = await uploadProofImage(influencerIdForPath, imageFile, onProgress);
        } else if (isEditMode && formData.proofImageUrl === "") {
            finalImageUrl = ""; // Image was removed
        }
    
        const influencerData: Omit<NewInfluencer, 'lastUpdate'> = {
            name: formData.name,
            instagram: formData.instagram.startsWith('@') ? formData.instagram : `@${formData.instagram}`,
            followers: parseInt(unformatFollowers(formData.followers), 10),
            status: formData.status,
            niche: formData.niche,
            contact: formData.contact,
            notes: formData.notes,
            isFumo: formData.isFumo,
            addedBy: influencer?.addedBy || user.uid,
            proofImageUrl: finalImageUrl,
        };

        if (isEditMode && influencer) {
            await updateInfluencer(influencer.id, influencerData);
        } else {
            const newInfluencer: NewInfluencer = {
                ...influencerData,
                lastUpdate: new Date(),
            };
            await addInfluencer(newInfluencer);
            setFormData(initialState);
            setImageFile(null);
            setImagePreview(null);
        }
        
        if (onFinished) {
            onFinished();
        }

    } catch (err) {
      console.error(err);
      setError(`Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} influenciador. Tente novamente.`);
    } finally {
        setIsLoading(false);
        setUploadProgress(null);
    }
  };

  return (
    <div className="py-4 max-h-[70vh] overflow-y-auto px-1 pr-4">
      <form onSubmit={handleSubmit}>
        <div className="grid w-full items-center gap-4">
          {/* Form fields */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Nome do Influenciador</Label>
            <Input id="name" placeholder="Ex: Maria Souza" value={formData.name} onChange={handleChange} required disabled={isLoading} />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="instagram">Instagram</Label>
            <div className="flex h-10 w-full items-center rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <span className="text-muted-foreground">@</span>
              <Input id="instagram" placeholder="username" value={formData.instagram.replace(/@/g, '')} onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value.replace(/@/g, '')}))} required className="border-0 bg-transparent p-0 pl-1 focus-visible:ring-0 focus-visible:ring-offset-0" disabled={isLoading} />
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="followers">Seguidores</Label>
            <Input id="followers" type="text" inputMode="numeric" placeholder="Ex: 150.000" value={formData.followers} onChange={handleChange} required disabled={isLoading} />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="niche">Nicho/Segmento</Label>
            <Input id="niche" placeholder="Ex: Fitness, Moda" value={formData.niche} onChange={handleChange} disabled={isLoading} />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={handleSelectChange} disabled={isLoading}>
              <SelectTrigger id="status"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Disponível">Disponível</SelectItem>
                <SelectItem value="Em negociação">Em negociação</SelectItem>
                <SelectItem value="Fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="flex flex-col space-y-1.5">
            <Label htmlFor="contact">Contato Preferencial (opcional)</Label>
            <Input id="contact" placeholder="Email ou WhatsApp" value={formData.contact} onChange={handleChange} disabled={isLoading} />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="notes">Observações/Situação</Label>
            <Textarea id="notes" placeholder="Responde rápido, cobra valor fixo..." value={formData.notes} onChange={handleChange} disabled={isLoading} />
          </div>

          {/* Image Upload */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="proofImage">Prova (Print, etc.)</Label>
            {imagePreview ? (
              <div className="relative w-full max-w-sm aspect-video rounded-md overflow-hidden group">
                <Image src={imagePreview} alt="Pré-visualização" layout="fill" objectFit="cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button type="button" variant="destructive" size="icon" onClick={removeImage} disabled={isLoading}><X className="h-5 w-5"/></Button>
                </div>
              </div>
            ) : (
                <div 
                    className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2"/>
                    <p className="text-sm text-muted-foreground">Clique para adicionar uma imagem</p>
                    <p className="text-xs text-muted-foreground/80">PNG, JPG, GIF até 5MB</p>
                </div>
            )}
            <Input id="proofImage" type="file" accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} className="hidden" ref={fileInputRef} disabled={isLoading} />
          </div>

          {uploadProgress !== null && (
            <div className="space-y-1">
                <Label>Progresso do Upload</Label>
                <Progress value={uploadProgress} />
            </div>
          )}


           <div className="flex items-center space-x-2">
             <input type="checkbox" id="isFumo" checked={formData.isFumo} onChange={handleChange} className="h-4 w-4" disabled={isLoading} />
            <Label htmlFor="isFumo" className="cursor-pointer">Marcar como "Fumo" (Não deu ROI)</Label>
          </div>
          {error && <div className="text-sm text-destructive flex items-center gap-2"><AlertCircle className="h-4 w-4"/> {error}</div>}
        </div>
        <div className="flex justify-end space-x-2 pt-6">
           <Button type="button" variant="ghost" onClick={handleCancel} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (uploadProgress !== null ? `Enviando... ${Math.round(uploadProgress)}%` : (isEditMode ? 'Salvando...' : 'Adicionando...')) : (isEditMode ? 'Salvar Alterações' : 'Adicionar')}
          </Button>
        </div>
      </form>
    </div>
  );
}
