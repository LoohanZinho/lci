
"use server";

import { auth, storage } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

interface UploadResult {
  downloadURL?: string;
  error?: string;
}

export async function uploadFile(
  formData: FormData
): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File | null;
    const influencerId = formData.get("influencerId") as string | null;

    if (!file || !influencerId) {
      return { error: "Arquivo ou ID do influenciador não fornecido." };
    }
    
    // Verificando a inicialização do admin
    if (!storage || typeof storage.bucket !== 'function') {
      console.error("Firebase Admin SDK Storage não inicializado corretamente.");
      return { error: "Erro de configuração do servidor ao fazer upload." };
    }

    const bucket = storage.bucket();
    const fileName = `${Date.now()}.${file.name.split('.').pop()}`;
    const filePath = `influencer-proofs/${influencerId}/${fileName}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const bucketFile = bucket.file(filePath);

    await bucketFile.save(fileBuffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // O Admin SDK não retorna a URL de download diretamente de forma fácil.
    // Construímos a URL pública no formato padrão.
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;

    revalidatePath("/");
    
    return { downloadURL };

  } catch (error: any) {
    console.error("Falha no upload do servidor:", error);
    // Verificar se o erro é de permissão no bucket
     if (error.code === 403 || (error.errors && error.errors[0].reason === 'forbidden')) {
        return { error: "Permissão negada para escrever no bucket de armazenamento. Verifique as regras do Storage." };
    }
    return { error: error.message || "Ocorreu um erro desconhecido no servidor." };
  }
}

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
      // Desativando o cache para depuração
      cache: 'no-store',
    });

    if (!response.ok) {
       console.error(`Instagram API Error: Status ${response.status} ${response.statusText}`);
       if (response.status === 404) {
         return { error: "Perfil não encontrado." };
       }
       // Tenta ler a resposta para mais detalhes, se houver
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
