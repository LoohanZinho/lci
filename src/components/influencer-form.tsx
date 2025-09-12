

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
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Trash2, UploadCloud, PlusCircle, History } from "lucide-react";
import Image from 'next/image';
import { getInfluencerClassification } from "@/lib/classification";
import { Timestamp } from "firebase/firestore";
import { Badge } from "./ui/badge";
import { deleteProofImageAction, uploadProofImageAction } from "@/app/actions";


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

type FileWithPreview = {
  file: File;
  preview: string;
};

export function InfluencerForm({ influencer, onFinished }: InfluencerFormProps) {
  const [formData, setFormData] = useState<FormData>(initialState);
  const [currentProduct, setCurrentProduct] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Create a stable ID for the new influencer during the form session.
  const [formInstanceId] = useState(() => influencer?.id || Date.now().toString());
  
  const [filesToUpload, setFilesToUpload] = useState<FileWithPreview[]>([]);

  const isEditMode = !!influencer;
  
  const followerCount = parseInt(unformatFollowers(formData.followers), 10) || 0;
  const classification = getInfluencerClassification(followerCount);

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
        proofImageUrls: influencer.proofImageUrls || [],
        products: influencer.products || [],
        lossReason: influencer.lossReason || "",
      });
    } else {
      setFormData(initialState);
    }
  }, [influencer]);

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    
    const newFiles = Array.from(selectedFiles);

    if (formData.proofImageUrls.length + filesToUpload.length + newFiles.length > 10) {
      setError("Você pode adicionar no máximo 10 imagens.");
      return;
    }

    const newFilesWithPreview = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setFilesToUpload(prev => [...prev, ...newFilesWithPreview]);

     // Limpa o input de arquivo para permitir a seleção do mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  const removeNewFile = (indexToRemove: number) => {
      const fileToRemove = filesToUpload[indexToRemove];
      URL.revokeObjectURL(fileToRemove.preview); // Libera memória
      setFilesToUpload(prev => prev.filter((_, i) => i !== indexToRemove));
  }

  const removeExistingImage = async (indexToRemove: number) => {
    const urlToRemove = formData.proofImageUrls[indexToRemove];
    if (!urlToRemove) return;

    setIsLoading(true);
    setError(null);
    setUploadMessage("Deletando imagem...");

    try {
        const result = await deleteProofImageAction(urlToRemove);
        if (!result.success) {
          throw new Error(result.error);
        }
        
        setFormData(prev => ({
            ...prev,
            proofImageUrls: prev.proofImageUrls.filter((_, i) => i !== indexToRemove)
        }));

    } catch (e: any) {
        console.error("Erro ao deletar imagem", e);
        setError(`Falha ao deletar imagem. ${e.message}`);
    } finally {
        setIsLoading(false);
        setUploadMessage("");
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
    filesToUpload.forEach(f => URL.revokeObjectURL(f.preview));
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
    
    // Upload de imagens foi removido por enquanto.
    const uploadedUrls: string[] = formData.proofImageUrls;

    setUploadMessage('Salvando dados do influenciador...');

    try {
        const influencerData = {
            name: formData.name,
            instagram: formData.instagram.startsWith('@') ? formData.instagram : `@${formData.instagram}`,
            followers: parseInt(unformatFollowers(formData.followers), 10),
            status: formData.status,
            niche: formData.niche,
            notes: formData.notes,
            isFumo: formData.isFumo,
            proofImageUrls: uploadedUrls,
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
             await addInfluencer(newInfluencerData, formInstanceId);
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
            <Label htmlFor="niche">Nicho/Segmento (opcional)</Label>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="status">Status</Label>
              {!formData.status && <span className="text-xs text-destructive">Obrigatório</span>}
            </div>
            <Select name="status" value={formData.status} onValueChange={handleSelectChange} required disabled={isLoading}>
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
            <Label htmlFor="notes">Observações/Situação (opcional)</Label>
            <Textarea id="notes" placeholder="Responde rápido, cobra valor fixo..." value={formData.notes} onChange={handleChange} disabled={isLoading} />
          </div>

          <div className="flex flex-col space-y-1.5">
             <Label>Ela te deu golpe? (Anexe as provas abaixo)</Label>
             <div className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md">
                 <p className="text-sm text-muted-foreground">Uploads em breve</p>
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
                <Button type="submit" className="relative bg-gradient-to-r from-[#fbda25] to-[#d3ab00] text-black" disabled={isLoading || !formData.status}>
                    {isLoading ? (uploadMessage || (isEditMode ? 'Salvando...' : 'Adicionando...')) : (isEditMode ? 'Salvar Alterações' : 'Adicionar')}
                </Button>
            </div>
        </div>
      </form>
    </div>
  );
}
