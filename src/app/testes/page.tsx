"use client";

import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, UploadCloud } from "lucide-react";
import Image from "next/image";
import { storage } from "@/lib/firebase"; // Client-side firebase config
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Progress } from "@/components/ui/progress";


type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadProgress {
  fileName: string;
  progress: number;
  error?: string;
  url?: string;
}

export default function TestesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [overallMessage, setOverallMessage] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      setStatus("idle");
      setOverallMessage("");
      setUploadProgress(selectedFiles.map(file => ({ fileName: file.name, progress: 0 })));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setStatus("error");
      setOverallMessage("Por favor, selecione pelo menos um arquivo.");
      return;
    }

    setStatus("uploading");
    setOverallMessage(`Iniciando upload de ${files.length} arquivo(s)...`);
    
    const uploadPromises = files.map((file, index) => {
      return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `test-uploads/${Date.now()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(prev => {
                const newProgress = [...prev];
                newProgress[index] = { ...newProgress[index], progress: progress };
                return newProgress;
            });
          },
          (error) => {
            console.error(`Upload Error for ${file.name}:`, error);
            const fullErrorMessage = `[${error.code}] ${error.message}`;
            setUploadProgress(prev => {
                const newProgress = [...prev];
                newProgress[index] = { ...newProgress[index], error: fullErrorMessage };
                return newProgress;
            });
            reject(new Error(fullErrorMessage));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setUploadProgress(prev => {
                const newProgress = [...prev];
                newProgress[index] = { ...newProgress[index], url: downloadURL, progress: 100 };
                return newProgress;
              });
              resolve(downloadURL);
            } catch (error: any) {
               const fullErrorMessage = `Erro ao obter URL: [${error.code}] ${error.message}`;
               setUploadProgress(prev => {
                const newProgress = [...prev];
                newProgress[index] = { ...newProgress[index], error: fullErrorMessage };
                return newProgress;
              });
              reject(new Error(fullErrorMessage));
            }
          }
        );
      });
    });

    try {
        await Promise.all(uploadPromises);
        setStatus("success");
        setOverallMessage("Todos os uploads foram concluídos com sucesso!");
        setFiles([]);
    } catch (error: any) {
        setStatus("error");
        setOverallMessage(`Ocorreram erros durante o upload. Verifique os detalhes abaixo.`);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teste de Upload (Client-Side)</h1>
      <p className="mb-6 text-muted-foreground">
        Selecione um ou mais arquivos e clique em "Fazer Upload" para enviá-los diretamente do seu navegador para o Firebase Storage.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Seletor de Arquivos</Label>
          <Input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>

        {files.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Arquivos Selecionados:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-lg border p-4">
              {files.map((file, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Prévia ${index + 1}`}
                    fill
                    className="rounded-md object-cover"
                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#fbda25] to-[#a98900] rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <Button
            onClick={handleUpload}
            disabled={status === "uploading" || files.length === 0}
            className="relative w-full bg-gradient-to-r from-[#fbda25] to-[#a98900] text-black"
          >
            {status === "uploading" ? (
              "Enviando..."
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Fazer Upload
              </>
            )}
          </Button>
        </div>

        {status !== "idle" && (
            <div className="space-y-4">
                {overallMessage && (
                     <div className={`flex items-center gap-3 p-3 rounded-md text-sm ${
                        status === "success" ? "bg-green-100 text-green-800" : ""
                        } ${status === "error" ? "bg-red-100 text-red-800" : ""
                        } ${status === "uploading" ? "bg-blue-100 text-blue-800" : ""}`
                    }>
                        {status === 'success' && <CheckCircle className="h-5 w-5" />}
                        {status === 'error' && <AlertCircle className="h-5 w-5" />}
                        <p>{overallMessage}</p>
                    </div>
                )}
                <div className="space-y-2">
                    {uploadProgress.map((item, index) => (
                        <div key={index} className="p-2 border rounded-md">
                            <p className="text-sm font-medium truncate">{item.fileName}</p>
                            <Progress value={item.progress} className="my-2" />
                            {item.error && (
                                <div className="flex items-start gap-2 text-sm text-destructive bg-red-50 p-2 rounded">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <p className="break-all">{item.error}</p>
                                </div>
                            )}
                             {item.url && (
                                <p className="text-xs text-green-600 break-all">Sucesso! URL: {item.url}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
