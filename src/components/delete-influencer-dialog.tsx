"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AlertCircle } from "lucide-react";

interface DeleteInfluencerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  influencerName: string;
  isLoading?: boolean;
}

const CORRECT_PASSWORD = "admin#123";

export function DeleteInfluencerDialog({
  isOpen,
  onClose,
  onConfirm,
  influencerName,
  isLoading = false,
}: DeleteInfluencerDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (password !== CORRECT_PASSWORD) {
      setError("Senha incorreta. Tente novamente.");
      return;
    }
    setError("");
    try {
      await onConfirm();
    } catch (e) {
      setError("Falha ao excluir. Tente novamente mais tarde.");
    }
  };

  // Reset state when dialog opens or closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setTimeout(() => {
        setPassword("");
        setError("");
      }, 200); // Delay to allow animation
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            {`Tem certeza que deseja excluir "${influencerName}"? Esta ação não pode ser desfeita.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-2 pt-2">
            <Label htmlFor="delete-password">Para confirmar, digite a senha de exclusão:</Label>
            <Input 
                id="delete-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                disabled={isLoading}
            />
            {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel onClick={onClose} disabled={isLoading}>Cancelar</AlertDialogCancel>
          <Button onClick={handleConfirm} disabled={isLoading || !password} variant="destructive">
            {isLoading ? "Excluindo..." : "Excluir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
