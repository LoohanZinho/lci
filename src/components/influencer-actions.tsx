"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { deleteInfluencer, InfluencerWithUserData } from "@/lib/influencers";
import { useState } from "react";
import { ConfirmationDialog } from "./confirmation-dialog";

interface InfluencerActionsProps {
  influencer: InfluencerWithUserData;
  onEdit: () => void;
  onView: () => void;
}

export function InfluencerActions({ influencer, onEdit, onView }: InfluencerActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);


  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteInfluencer(influencer.id);
      setIsConfirmingDelete(false);
    } catch (error) {
      console.error("Failed to delete influencer", error);
      alert("Falha ao excluir o influenciador.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end space-x-1">
        <Button variant="ghost" size="icon" onClick={onView}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">Ver detalhes</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsConfirmingDelete(true)}
          disabled={isDeleting}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Excluir</span>
        </Button>
      </div>
      <ConfirmationDialog
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir "${influencer.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        isLoading={isDeleting}
      />
    </>
  );
}
