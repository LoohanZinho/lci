"use client";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  uploadBytes,
} from "firebase/storage";
import { storage } from "./firebase";

export const uploadProofImage = (
    influencerId: string,
    file: File,
    onProgress: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `influencer-proofs/${influencerId}/${fileName}`);

    // Usar uploadBytes (put) para um upload mais simples que evita problemas de CORS
    // em alguns ambientes. A barra de progresso será menos granular, mas o upload
    // será mais confiável.
    onProgress(0);
    uploadBytes(storageRef, file).then(snapshot => {
        onProgress(100);
        getDownloadURL(snapshot.ref).then(downloadURL => {
            resolve(downloadURL);
        }).catch(reject);
    }).catch(error => {
        console.error("Upload failed:", error);
        reject(error);
    });
  });
};


export const deleteProofImageByUrl = async (imageUrl: string): Promise<void> => {
    if (!imageUrl) return;
    try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        console.log("Image successfully deleted from storage.");
    } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
            console.error("Error deleting image from storage:", error);
            throw error;
        } else {
            console.log("Image not found in storage, likely already deleted.");
        }
    }
}
