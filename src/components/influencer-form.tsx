
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
import { addInfluencer, NewInfluencer, Influencer, updateInfluencer, UpdatableInfluencerData, ProductPublication } from "@/lib/influencers";
import { useAuth } from "@/hooks/use-auth";
import { useState, FormEvent, useEffect, useRef } from "react";
import { deleteProofImageByUrl } from "@/lib/storage";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Image as ImageIcon, Trash2, UploadCloud, PlusCircle, History } from "lucide-react";
import Image from 'next/image';
import { getInfluencerClassification } from "@/lib/classification";
import { Timestamp } from "firebase/firestore";
import { Badge } from "./ui/badge";
import { uploadFile } from "@/app/actions";

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
  notes: string;
  isFumo: boolean;
  proofImageUrls: string[];
  products: ProductPublication[];
  lossReason: string;
}


const initialState: FormData = {
  name: "",
  instagram: "",
  followers: "",
  status: "Desconhecido",
  niche: "",
  notes: "",
  isFumo: false,
  proofImageUrls: [],
  products: [],
  lossReason: "",
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
  const [currentProduct, setCurrentProduct] = useState("");
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
        notes: influencer.notes,
        isFumo: influencer.isFumo,
        proofImageUrls: influencer.proofImageUrls || [],
        products: influencer.products || [],
        lossReason: influencer.lossReason || "",
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
  
  const handleAddProduct = () => {
    if (currentProduct.trim()) {
      const newProduct: ProductPublication = {
        name: currentProduct.trim(),
        addedAt: Timestamp.now(),
      };
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, newProduct],
      }));
      setCurrentProduct("");
    }
  };

  const handleRemoveProduct = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, index) => index !== indexToRemove),
    }));
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
        
        // Handle new image uploads via Server Action
        if (imageFiles.length > 0) {
          const influencerIdForStorage = influencer?.id || Date.now().toString();
          const uploadedUrls: string[] = [];
          
          setUploadProgress(0); // Indicate that upload is starting
      
          for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            setUploadMessage(`Enviando ${i + 1} de ${imageFiles.length}...`);
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);
            uploadFormData.append("influencerId", influencerIdForStorage);

            const result = await uploadFile(uploadFormData);
            
            if (result.error) {
              throw new Error(`Falha no upload de "${file.name}". Causa: ${result.error}`);
            }
            if (result.downloadURL) {
              uploadedUrls.push(result.downloadURL);
            }
            // Update "progress" after each file. Not a real progress bar, but shows activity.
            setUploadProgress(((i + 1) / imageFiles.length) * 100);
          }
      
          finalImageUrls = [...finalImageUrls, ...uploadedUrls];
        }

        setUploadMessage('Salvando dados...');
        const influencerData = {
            name: formData.name,
            instagram: formData.instagram.startsWith('@') ? formData.instagram : `@${formData.instagram}`,
            followers: parseInt(unformatFollowers(formData.followers), 10),
            status: formData.status,
            niche: formData.niche,
            notes: formData.notes,
            isFumo: formData.isFumo,
            proofImageUrls: finalImageUrls,
            products: formData.products,
            lossReason: formData.lossReason,
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
            <Label htmlFor="product">Produto Divulgado (opcional)</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="product" 
                placeholder="Ex: Produto X" 
                value={currentProduct} 
                onChange={(e) => setCurrentProduct(e.target.value)} 
                disabled={isLoading}
              />
              <Button type="button" size="icon" onClick={handleAddProduct} disabled={isLoading || !currentProduct.trim()}>
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            {formData.products.length > 0 && (
              <div className="mt-2 space-y-2 rounded-md border p-3">
                 <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <History className="h-4 w-4" />
                    <span>Histórico de Produtos</span>
                 </div>
                 <div className="flex flex-wrap gap-2">
                  {formData.products.map((product, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1.5 pr-1">
                      <span>{product.name}</span>
                      <button type="button" onClick={() => handleRemoveProduct(index)} disabled={isLoading} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                 </div>
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={handleSelectChange} disabled={isLoading}>
              <SelectTrigger id="status"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Desconhecido">Desconhecido (Ninguém fechou)</SelectItem>
                <SelectItem value="Em negociação">Em negociação</SelectItem>
                <SelectItem value="Fechado">Fechado</SelectItem>
                <SelectItem value="Prejuízo">Prejuízo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.status === 'Prejuízo' && (
             <div className="flex flex-col space-y-1.5">
                <Label htmlFor="lossReason">Diga mais sobre essa publi (opcional)</Label>
                <Textarea id="lossReason" placeholder="Ex: Engajamento baixo, não converteu em vendas..." value={formData.lossReason} onChange={handleChange} disabled={isLoading} />
            </div>
          )}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="notes">Observações/Situação</Label>
            <Textarea id="notes" placeholder="Responde rápido, cobra valor fixo..." value={formData.notes} onChange={handleChange} disabled={isLoading} />
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="proofImage">Prova (Print, etc.)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-full aspect-square rounded-md overflow-hidden group border">
                        <Image src={preview} alt={`Pré-visualização ${index + 1}`} fill style={{ objectFit: 'cover' }} />
                        <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon" 
                            onClick={() => removeImage(index)} 
                            disabled={isLoading} 
                            className="absolute top-1 right-1 h-7 w-7 opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="h-4 w-4"/>
                        </Button>
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
                    <Label className="text-primary">{uploadMessage || 'Enviando...'}</Label>
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
            {isLoading ? (uploadProgress !== null ? 'Enviando...' : (isEditMode ? 'Salvando...' : 'Adicionando...')) : (isEditMode ? 'Salvar Alterações' : 'Adicionar')}
          </Button>
        </div>
      </form>
    </div>
  );
}
