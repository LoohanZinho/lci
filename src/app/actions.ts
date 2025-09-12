
"use server";

import { revalidatePath } from "next/cache";
import { deleteProofImageByUrl, uploadProofImage } from "@/lib/storage-server";
import { Readable } from 'stream';

// --- AÇÕES DE UPLOAD E DELEÇÃO DE IMAGENS ---

export async function uploadFileAction(formData: FormData): Promise<{ success: boolean, url?: string, error?: string }> {
  const file = formData.get("file") as File | null;
  const influencerId = formData.get("influencerId") as string | null;

  if (!file || !influencerId) {
    return { success: false, error: "Arquivo ou ID do influenciador não encontrado." };
  }

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);

    const downloadURL = await uploadProofImage(readableStream, file.name, file.type, influencerId);
    return { success: true, url: downloadURL };
  } catch (error: any) {
    console.error("❌ Erro no upload via Server Action:", error);
    return { success: false, error: "Falha ao fazer upload do arquivo. " + error.message };
  }
}

export async function deleteProofImageAction(imageUrl: string): Promise<{ success: boolean, error?: string }> {
    if (!imageUrl) {
        return { success: false, error: "URL da imagem não fornecida." };
    }
    try {
        await deleteProofImageByUrl(imageUrl);
        return { success: true };
    } catch (error: any) {
        console.error("❌ Erro ao deletar imagem via Server Action:", error);
        return { success: false, error: "Falha ao deletar a imagem. " + error.message };
    }
}


// --- AÇÃO DE BUSCA DE PERFIL DO INSTAGRAM ---

interface ProfilePicResult {
  profilePicUrl?: string;
  error?: string;
}

export async function getInstagramProfilePic(username: string): Promise<ProfilePicResult> {
  if (!username) {
    return { error: "Nome de usuário não fornecido." };
  }
  
  try {
    const url = `https://www.instagram.com/${username}/?__a=1&__d=dis`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
      },
      cache: 'no-store',
    });

    if (!response.ok) {
       console.error(`Instagram API Error: Status ${response.status} ${response.statusText}`);
       if (response.status === 404) {
         return { error: "Perfil não encontrado." };
       }
       const errorBody = await response.text();
       console.error("Instagram API Response Body:", errorBody);
       throw new Error(`Instagram API retornou status ${response.status}`);
    }

    const data = await response.json();
    
    const profilePicUrl = data?.graphql?.user?.profile_pic_url_hd || data?.graphql?.user?.profile_pic_url;

    if (profilePicUrl) {
      return { profilePicUrl };
    } else {
      return { error: "Não foi possível encontrar a foto de perfil na resposta." };
    }
  } catch (error: any) {
    console.error("❌ Erro ao buscar perfil do Instagram:", error.message);
    return { error: "Falha ao buscar perfil. O perfil pode ser privado ou não existir." };
  }
}
