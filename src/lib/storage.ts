"use client";

import {
  ref,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";

// A função de upload foi movida para um Server Action em src/app/actions.ts
// para contornar problemas de CORS. Esta função de exclusão ainda é necessária
// e funciona bem no lado do cliente.

export const deleteProofImageByUrl = async (imageUrl: string): Promise<void> => {
    if (!imageUrl) return;
    try {
        // O SDK do cliente é inteligente o suficiente para analisar URLs do GCS
        // mesmo que tenham tokens de acesso.
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        console.log("Imagem excluída com sucesso do storage.");
    } catch (error: any) {
        // Se a imagem não for encontrada, não é um erro crítico.
        if (error.code !== 'storage/object-not-found') {
            console.error("Erro ao excluir a imagem do storage:", error);
            // Em um app de produção, você pode querer logar isso em um serviço de monitoramento.
            throw error;
        } else {
            console.log("Imagem não encontrada no storage, provavelmente já foi excluída.");
        }
    }
}
