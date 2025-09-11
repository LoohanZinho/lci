
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
import { addInfluencer, NewInfluencer, Influencer, updateInfluencer, UpdatableInfluencerData } from "@/lib/influencers";
import { useAuth } from "@/hooks/use-auth";
import { useState, FormEvent, useEffect, useRef } from "react";
import { deleteProofImageByUrl, uploadProofImage } from "@/lib/storage";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Image as ImageIcon, X, UploadCloud } from "lucide-react";
import Image from 'next/image';
import { getInfluencerClassification } from "@/lib/classification";

interface InfluencerFormProps {
  influencer?: Influencer;
  onFinished?: () => void;
}

// Interface for the form's state, allowing followers to be a string for display purposes.
interface FormData {
  name: string;
  instagram: string;
  followers: string;
  status: string;
  niche: string;
  contact: string;
  notes: string;
  isFumo: boolean;
  proofImageUrls: string[];
}


const initialState: FormData = {
  name: "",
  instagram: "",
  followers: "",
  status: "Disponível",
  niche: "",
  contact: "",
  notes: "",
  isFumo: false,
  proofImageUrls: [],
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
  const [formData, setFormData] = useState<FormData>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!influencer;
  
  const followerCount = parseInt(unformatFollowers(formData.followers), 10) || 0;
  const classification = getInfluencerClassification(followerCount);

  useEffect(() => {
    if (influencer) {
      const currentData: FormData = {
        name: influencer.name,
        instagram: influencer.instagram.startsWith('@') ? influencer.instagram.substring(1) : influencer.instagram,
        followers: formatFollowers(influencer.followers.toString()),
        status: influencer.status,
        niche: influencer.niche,
        contact: influencer.contact,
        notes: influencer.notes,
        isFumo: influencer.isFumo,
        proofImageUrls: influencer.proofImageUrls || [],
      };
      setFormData(currentData);
      setImagePreviews(influencer.proofImageUrls || []);
      setImageFiles([]);
    } else {
      setFormData(initialState);
      setImagePreviews([]);
      setImageFiles([]);
    }
  }, [influencer]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = imagePreviews.length + newFiles.length;

    if (totalImages > 10) {
      setError("Você pode adicionar no máximo 10 imagens.");
      return;
    }

    for(const file of newFiles) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError(`A imagem "${file.name}" excede o limite de 5MB.`);
            return;
        }
    }
    
    setError(null);
    const updatedFiles = [...imageFiles, ...newFiles];
    setImageFiles(updatedFiles);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (indexToRemove: number) => {
    const urlToRemove = imagePreviews[indexToRemove];
  
    // Filter out the preview
    setImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove));
  
    // Check if the removed preview was from a new file (blob URL)
    if (urlToRemove.startsWith('blob:')) {
      const fileIndexToRemove = imageFiles.findIndex(file => URL.createObjectURL(file) === urlToRemove);
      if (fileIndexToRemove > -1) {
        setImageFiles(prev => prev.filter((_, i) => i !== fileIndexToRemove));
      }
    }
  };
  

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
    setUploadMessage('');

    try {
        let finalImageUrls: string[] = isEditMode ? imagePreviews.filter(p => !p.startsWith('blob:')) : [];

        // Handle image deletions in edit mode
        if (isEditMode) {
            const originalUrls = influencer?.proofImageUrls || [];
            const urlsToDelete = originalUrls.filter(url => !imagePreviews.includes(url));
            if (urlsToDelete.length > 0) {
                 setUploadMessage(`Removendo ${urlsToDelete.length} imagem(ns)...`);
                 await Promise.all(urlsToDelete.map(url => deleteProofImageByUrl(url)));
            }
        }
        
        // Handle new image uploads
        if (imageFiles.length > 0) {
          const influencerIdForStorage = influencer?.id || Date.now().toString();
          const uploadedUrls: string[] = [];
          let filesUploaded = 0;
          
          setUploadProgress(0);
          setUploadMessage(`Enviando 0 de ${imageFiles.length}...`);
      
          await Promise.all(
            imageFiles.map(async (file, index) => {
              try {
                const downloadURL = await uploadProofImage(
                  influencerIdForStorage,
                  file,
                  (progress) => {
                    // This logic is simplified since uploadBytesResumable provides granular progress.
                  }
                );
                uploadedUrls.push(downloadURL);
                filesUploaded++;
                const overallProgress = (filesUploaded / imageFiles.length) * 100;
                setUploadProgress(overallProgress);
                setUploadMessage(`Enviando ${filesUploaded} de ${imageFiles.length}...`);
              } catch (uploadError: any) {
                 console.error("Upload Error:", uploadError);
                 // Stop further uploads on the first error.
                 throw new Error(`Falha no upload de "${file.name}". Causa: ${uploadError.message || 'Erro desconhecido'}`);
              }
            })
          );
      
          finalImageUrls = [...finalImageUrls, ...uploadedUrls];
        }

        setUploadMessage('Salvando dados...');
        const influencerData = {
            name: formData.name,
            instagram: formData.instagram.startsWith('@') ? formData.instagram : `@${formData.instagram}`,
            followers: parseInt(unformatFollowers(formData.followers), 10),
            status: formData.status,
            niche: formData.niche,
            contact: formData.contact,
            notes: formData.notes,
            isFumo: formData.isFumo,
            proofImageUrls: finalImageUrls,
        };
        
        if (isEditMode && influencer) {
             const dataToUpdate: UpdatableInfluencerData = { ...influencerData };
             await updateInfluencer(influencer.id, user.uid, dataToUpdate);
        } else {
             const newInfluencerData: Omit<NewInfluencer, 'lastUpdate' | 'editors'> = {
                ...influencerData,
                addedBy: user.uid,
             };
             await addInfluencer(newInfluencerData);
        }
        
        if (onFinished) {
            onFinished();
        }

    } catch (err: any) {
      console.error(err);
      setError(err.message || `Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} influenciador. Tente novamente.`);
    } finally {
        setIsLoading(false);
        setUploadProgress(null);
        setUploadMessage('');
    }
  };

  return (
    <div className="py-4 max-h-[70vh] overflow-y-auto px-1 pr-4">
      <form onSubmit={handleSubmit}>
        <div className="grid w-full items-center gap-4">
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
            <div className="flex items-center gap-2">
              <Input id="followers" type="text" inputMode="numeric" placeholder="Ex: 150.000" value={formData.followers} onChange={handleChange} required disabled={isLoading} className="flex-1" />
              {followerCount > 0 && <span className="text-sm text-muted-foreground bg-secondary px-3 py-2 rounded-md">{classification}</span>}
            </div>
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

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="proofImage">Prova (Print, etc.)</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-full aspect-square rounded-md overflow-hidden group">
                        <Image src={preview} alt={`Pré-visualização ${index + 1}`} fill style={{ objectFit: 'cover' }} />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeImage(index)} disabled={isLoading} className="h-8 w-8"><X className="h-4 w-4"/></Button>
                        </div>
                    </div>
                ))}
                {imagePreviews.length < 10 && (
                    <div 
                        className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadCloud className="h-8 w-8 text-muted-foreground mb-2"/>
                        <p className="text-xs text-center text-muted-foreground">Adicionar ({imagePreviews.length}/10)</p>
                    </div>
                )}
            </div>
            <Input id="proofImage" type="file" accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} className="hidden" ref={fileInputRef} disabled={isLoading || imagePreviews.length >= 10} multiple />
            <p className="text-xs text-muted-foreground/80 mt-1">PNG, JPG, GIF até 5MB cada.</p>
          </div>

          {uploadProgress !== null && !error && (
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label className="text-primary">{uploadMessage}</Label>
                    <span className="text-sm font-medium text-primary">{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
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
            {isLoading ? (uploadMessage ? 'Enviando...' : (isEditMode ? 'Salvando...' : 'Adicionando...')) : (isEditMode ? 'Salvar Alterações' : 'Adicionar')}
          </Button>
        </div>
      </form>
    </div>
  );
}

    