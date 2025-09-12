
"use client";

import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, UploadCloud } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { uploadTestImageAction } from "@/app/actions";


type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadProgress {
  fileName: string;
  status: "pending" | "uploading" | "success" | "error";
  message?: string;
  url?: string;
}

export default function TestesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [overallStatus, setOverallStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [overallMessage, setOverallMessage] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      setOverallStatus("idle");
      setOverallMessage("");
      setUploadProgress(selectedFiles.map(file => ({ fileName: file.name, status: "pending" })));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setOverallStatus("error");
      setOverallMessage("Por favor, selecione pelo menos um arquivo.");
      return;
    }

    setOverallStatus("uploading");
    setOverallMessage(`Iniciando upload de ${files.length} arquivo(s)...`);

    let allSucceeded = true;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update status for the specific file
        setUploadProgress(prev => {
            const newProgress = [...prev];
            newProgress[i].status = 'uploading';
            return newProgress;
        });

        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadTestImageAction(formData);

        if (result.error) {
            allSucceeded = false;
            setUploadProgress(prev => {
                const newProgress = [...prev];
                newProgress[i].status = 'error';
                newProgress[i].message = result.error;
                return newProgress;
            });
        } else if (result.url) {
            setUploadProgress(prev => {
                const newProgress = [...prev];
                newProgress[i].status = 'success';
                newProgress[i].url = result.url;
                return newProgress;
            });
        }
    }

    if (allSucceeded) {
        setOverallStatus("success");
        setOverallMessage("Todos os uploads foram concluídos com sucesso!");
        setFiles([]); // Clear selection on full success
    } else {
        setOverallStatus("error");
        setOverallMessage("Ocorreram erros durante o upload. Verifique os detalhes abaixo.");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teste de Upload (Server Action)</h1>
      <p className="mb-6 text-muted-foreground">
        Selecione arquivos e clique para enviá-los ao Firebase Storage via Server Action, contornando problemas de CORS.
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
            disabled={overallStatus === "uploading" || files.length === 0}
            className="relative w-full bg-gradient-to-r from-[#fbda25] to-[#a98900] text-black"
          >
            {overallStatus === "uploading" ? (
              "Enviando..."
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Fazer Upload
              </>
            )}
          </Button>
        </div>

        {overallStatus !== "idle" && (
            <div className="space-y-4">
                {overallMessage && (
                     <div className={`flex items-center gap-3 p-3 rounded-md text-sm ${
                        overallStatus === "success" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" : ""
                        } ${overallStatus === "error" ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200" : ""
                        } ${overallStatus === "uploading" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200" : ""}`
                    }>
                        {overallStatus === 'success' && <CheckCircle className="h-5 w-5" />}
                        {overallStatus === 'error' && <AlertCircle className="h-5 w-5" />}
                        <p>{overallMessage}</p>
                    </div>
                )}
                <div className="space-y-2">
                    {uploadProgress.map((item, index) => (
                        <div key={index} className="p-2 border rounded-md">
                            <p className="text-sm font-medium truncate">{item.fileName}</p>
                            
                            {item.status === 'uploading' && <Progress value={50} className="my-2 animate-pulse" />}
                            {item.status === 'success' && <Progress value={100} className="my-2" />}
                            
                            {item.status === 'error' && (
                                <div className="flex items-start gap-2 text-sm text-destructive bg-red-50 dark:bg-red-900/20 p-2 rounded mt-2">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <p className="break-all">{item.message}</p>
                                </div>
                            )}
                             {item.status === 'success' && item.url && (
                                <p className="text-xs text-green-600 dark:text-green-400 break-all mt-2">Sucesso! URL: {item.url}</p>
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
