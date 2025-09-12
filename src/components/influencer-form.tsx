
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
import { useState, FormEvent, useEffect, useRef, ChangeEvent } from "react";
import { AlertCircle, Trash2, History, PlusCircle, UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { getInfluencerClassification } from "@/lib/classification";
import { Timestamp } from "firebase/firestore";
import { Badge } from "./ui/badge";
import { deleteProofImageAction, uploadProofImageAction } from "@/app/actions";
import { Progress } from "./ui/progress";
import Image from "next/image";

interface InfluencerFormProps {
  influencer?: Influencer;
  onFinished?: () => void;
}

interface FormData {
  name: string;
  instagram: string;
  followers: string;
  status: string;
  niche: string;
  notes: string;
  isFumo: boolean;
  products: ProductPublication[];
  lossReason: string;
  proofImageUrls: string[];
}

interface FileToUpload {
  file: File;
  progress: number;
  error?: string;
  url?: string;
}

const initialState: FormData = {
  name: "",
  instagram: "",
  followers: "",
  status: "Desconhecido",
  niche: "",
  notes: "",
  isFumo: false,
  products: [],
  lossReason: "",
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
  const [currentProduct, setCurrentProduct] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const statusRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formInstanceId] = useState(() => influencer?.id || Date.now().toString());

  const [filesToUpload, setFilesToUpload] = useState<FileToUpload[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  
  const isEditMode = !!influencer;
  
  const followerCount = parseInt(unformatFollowers(formData.followers), 10) || 0;
  const classification = getInfluencerClassification(followerCount);
  
  const IMAGE_LIMIT = 10;

  useEffect(() => {
    if (influencer) {
      setFormData({
        name: influencer.name,
        instagram: influencer.instagram.startsWith('@') ? influencer.instagram.substring(1) : influencer.instagram,
        followers: formatFollowers(influencer.followers.toString()),
        status: influencer.status || "Desconhecido",
        niche: influencer.niche,
        notes: influencer.notes,
        isFumo: influencer.isFumo,
        products: influencer.products || [],
        lossReason: influencer.lossReason || "",
        proofImageUrls: influencer.proofImageUrls || [],
      });
    } else {
      setFormData(initialState);
    }
  }, [influencer]);

  const handleImageSelection = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files) {
      const currentImageCount = formData.proofImageUrls.length + filesToUpload.length;
      const remainingSlots = IMAGE_LIMIT - currentImageCount;

      if (remainingSlots <= 0) {
        setUploadError(`Você já atingiu o limite de ${IMAGE_LIMIT} imagens.`);
        return;
      }

      const files = Array.from(e.target.files);
      if(files.length > remainingSlots) {
        setUploadError(`Você só pode adicionar mais ${remainingSlots} imagem(ns). As demais foram ignoradas.`);
      }

      const newFiles = files.slice(0, remainingSlots).map(file => ({
        file,
        progress: 0,
      }));

      setFilesToUpload(prev => [...prev, ...newFiles]);
    }
  };

  const removeNewFile = (index: number) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index));
    setUploadError(null);
  }

  const removeExistingImage = (imageUrl: string) => {
    setFormData(prev => ({...prev, proofImageUrls: prev.proofImageUrls.filter(url => url !== imageUrl)}));
    setImagesToDelete(prev => [...prev, imageUrl]);
    setUploadError(null);
  }
  
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

    if (!formData.status || formData.status === "Desconhecido") {
      statusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setError("Por favor, selecione um status válido.");
      return;
    }

    if (!user) {
      setError("Você precisa estar logado para realizar esta ação.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setUploadError(null);
    
    try {
        // 1. Upload new images
        const uploadPromises = filesToUpload.map(async (fileObj, index) => {
            const formData = new FormData();
            formData.append("file", fileObj.file);
            formData.append("path", `proofs/${formInstanceId}`);
            
            const result = await uploadProofImageAction(formData);

            if (result.error) {
                throw new Error(`Erro no upload de ${fileObj.file.name}: ${result.error}`);
            }
            return result.url;
        });

        const newImageUrls = (await Promise.all(uploadPromises)).filter((url): url is string => !!url);
        
        const finalImageUrls = [...formData.proofImageUrls, ...newImageUrls];

        const influencerData = {
            name: formData.name,
            instagram: formData.instagram.startsWith('@') ? formData.instagram : `@${formData.instagram}`,
            followers: parseInt(unformatFollowers(formData.followers), 10),
            status: formData.status,
            niche: formData.niche,
            notes: formData.notes,
            isFumo: formData.isFumo,
            products: formData.products,
            lossReason: formData.lossReason,
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
             await addInfluencer(newInfluencerData, formInstanceId);
        }

        // 3. Delete marked images
        if (imagesToDelete.length > 0) {
            const deletePromises = imagesToDelete.map(url => deleteProofImageAction(url));
            await Promise.all(deletePromises); // We can do this in the background
        }
        
        if (onFinished) {
            onFinished();
        }

    } catch (err: any) {
      console.error(err);
      setError(err.message || `Falha ao ${isEditMode ? 'atualizar' : 'adicionar'} influenciador. Tente novamente.`);
    } finally {
        setIsLoading(false);
    }
  };

  const totalImageCount = formData.proofImageUrls.length + filesToUpload.length;
  const canUploadMore = totalImageCount < IMAGE_LIMIT;

  return (
    <div className="py-4 max-h-[70vh] overflow-y-auto px-1 pr-4">
      <form onSubmit={handleSubmit}>
        <div className="grid w-full items-center gap-4">
          {/* --- Campos do Formulário --- */}
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
            <Label htmlFor="niche">Nicho/Segmento (opcional)</Label>
            <Input id="niche" placeholder="Ex: Fitness, Moda" value={formData.niche} onChange={handleChange} disabled={isLoading} />
          </div>
           <div className="flex flex-col space-y-1.5">
            <Label htmlFor="product">Produto Divulgado (opcional)</Label>
            <div className="flex items-center gap-2">
              <Input id="product" placeholder="Ex: Produto X" value={currentProduct} onChange={(e) => setCurrentProduct(e.target.value)} disabled={isLoading} />
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
          <div ref={statusRef} className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="status">Status</Label>
              {(!formData.status || formData.status === "Desconhecido") && <span className="text-xs text-destructive">Obrigatório</span>}
            </div>
            <Select name="status" value={formData.status} onValueChange={handleSelectChange} required disabled={isLoading}>
              <SelectTrigger id="status"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Desconhecido">Desconhecido (Ninguém fechou)</SelectItem>
                <SelectItem value="Em negociação">Em negociação</SelectItem>
                <SelectItem value="Fechado">Fechado</SelectItem>
                <SelectItem value="Prejuízo">Prejuízo</SelectItem>
                <SelectItem value="Golpista">Golpista</SelectItem>
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
            <Label htmlFor="notes">Observações/Situação (opcional)</Label>
            <Textarea id="notes" placeholder="Responde rápido, cobra valor fixo..." value={formData.notes} onChange={handleChange} disabled={isLoading} />
          </div>
          {/* --- Seção de Upload --- */}
          <div className="flex flex-col space-y-1.5">
            <Label>Ela te deu golpe? (Anexe as provas abaixo - Máx. {IMAGE_LIMIT})</Label>
            <div className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-md space-y-4">
              <Input type="file" ref={fileInputRef} onChange={handleImageSelection} multiple accept="image/*" className="hidden" />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading || !canUploadMore}>
                <UploadCloud className="mr-2 h-4 w-4" />
                Selecionar Arquivos ({totalImageCount}/{IMAGE_LIMIT})
              </Button>

              {uploadError && <div className="text-sm text-destructive flex items-center gap-2"><AlertCircle className="h-4 w-4"/> {uploadError}</div>}
              
              {(formData.proofImageUrls.length > 0 || filesToUpload.length > 0) ? (
                <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Imagens existentes */}
                  {formData.proofImageUrls.map(url => (
                    <div key={url} className="relative group aspect-square rounded-md overflow-hidden border">
                      <Image src={url} alt="Prova existente" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => removeExistingImage(url)} disabled={isLoading}>
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>
                  ))}
                  {/* Novas imagens */}
                  {filesToUpload.map((fileObj, index) => (
                     <div key={index} className="relative group aspect-square rounded-md overflow-hidden border">
                       <Image src={URL.createObjectURL(fileObj.file)} alt="Nova prova" fill className="object-cover" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => removeNewFile(index)} disabled={isLoading}>
                            <X className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground flex flex-col items-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50 mb-2"/>
                    Nenhuma imagem selecionada.
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <input type="checkbox" id="isFumo" checked={formData.isFumo} onChange={handleChange} className="h-4 w-4" disabled={isLoading} />
            <Label htmlFor="isFumo" className="cursor-pointer">Marcar como "Fumo" (Não deu ROI)</Label>
          </div>
          {error && <div className="text-sm text-destructive flex items-center gap-2"><AlertCircle className="h-4 w-4"/> {error}</div>}
        </div>
        <div className="flex justify-end space-x-2 pt-6">
           <Button type="button" variant="ghost" onClick={handleCancel} disabled={isLoading}>Cancelar</Button>
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#fbda25] to-[#a98900] rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <Button type="submit" className="relative bg-gradient-to-r from-[#fbda25] to-[#d3ab00] text-black" disabled={isLoading}>
                    {isLoading ? (isEditMode ? 'Salvando...' : 'Adicionando...') : (isEditMode ? 'Salvar Alterações' : 'Adicionar')}
                </Button>
            </div>
        </div>
      </form>
    </div>
  );
}

    