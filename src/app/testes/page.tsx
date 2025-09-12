"use client";

import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, UploadCloud } from "lucide-react";
import Image from "next/image";
import { uploadTestImageAction } from "@/app/actions";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function TestesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setStatus("idle");
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setStatus("error");
      setMessage("Por favor, selecione pelo menos um arquivo.");
      return;
    }

    setStatus("uploading");
    setMessage(`Iniciando upload de ${files.length} arquivo(s)...`);

    try {
      const uploadPromises = files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        
        const result = await uploadTestImageAction({
          buffer: Buffer.from(buffer),
          fileName: file.name,
          contentType: file.type,
        });

        if (result.error) {
          throw new Error(`Erro no arquivo ${file.name}: ${result.error}`);
        }
        return result.url;
      });

      const urls = await Promise.all(uploadPromises);

      setStatus("success");
      setMessage(`Upload concluído com sucesso! ${urls.length} arquivo(s) enviado(s).`);
      console.log("URLs dos arquivos:", urls);
      setFiles([]);
    } catch (error: any) {
      setStatus("error");
      setMessage(`Falha no upload: ${error.message}`);
      console.error(error);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teste de Upload para o Firebase Storage</h1>
      <p className="mb-6 text-muted-foreground">
        Selecione um ou mais arquivos de imagem e clique em "Fazer Upload" para enviá-los.
      </p>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Seletor de Imagens</Label>
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
            <h3 className="font-semibold mb-2">Imagens Selecionadas:</h3>
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

        {status !== "idle" && message && (
          <div className={`flex items-center gap-3 p-3 rounded-md text-sm ${
              status === "success" ? "bg-green-100 text-green-800" : ""
            } ${status === "error" ? "bg-red-100 text-red-800" : ""
            } ${status === "uploading" ? "bg-blue-100 text-blue-800" : ""}`
          }>
            {status === 'success' && <CheckCircle className="h-5 w-5" />}
            {status === 'error' && <AlertCircle className="h-5 w-5" />}
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
