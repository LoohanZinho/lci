
"use server";

import { revalidatePath } from "next/cache";
import { uploadProofImage } from "@/lib/storage-server";
import { Readable } from "stream";

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

// --- AÇÃO DE UPLOAD PARA TESTES ---
interface UploadResult {
    url?: string;
    error?: string;
}

export async function uploadTestImageAction(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file") as File | null;

  if (!file) {
    return { error: "Nenhum arquivo recebido." };
  }

  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const url = await uploadProofImage({
      fileBuffer: fileBuffer,
      fileName: file.name,
      contentType: file.type,
      path: `test-uploads`,
    });

    return { url };
  } catch (error: any) {
    console.error("❌ Erro no upload da imagem:", error);
    return { error: `Falha ao salvar o arquivo no Storage. Detalhes: ${error.message}` };
  }
}
