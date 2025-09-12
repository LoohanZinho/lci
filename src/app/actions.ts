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
