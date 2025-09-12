
"use server";

import { auth, storage } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

// A função de upload foi movida para o lado do cliente em `influencer-form.tsx`
// para resolver problemas de limite de corpo de requisição (erro 400).
// Esta função de servidor não é mais usada para upload.

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
