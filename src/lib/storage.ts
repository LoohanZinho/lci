"use client";

import {
  ref,
  deleteObject,
  uploadBytesResumable,
  getDownloadURL
} from "firebase/storage";
import { storage } from "./firebase";

export const uploadProofImage = (
    influencerId: string,
    file: File,
    onProgress: (progress: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileName = `${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `influencer-proofs/${influencerId}/${fileName}`;
      const storageRef = ref(storage, filePath);
  
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          reject(new Error(`Falha no upload de "${file.name}". Causa: ${error.message}`));
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          }).catch(reject);
        }
      );
    });
  };

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
