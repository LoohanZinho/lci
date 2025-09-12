"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { deleteInfluencer, InfluencerWithUserData } from "@/lib/influencers";
import { useState } from "react";
import { DeleteInfluencerDialog } from "./delete-influencer-dialog";

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
      setIsConfirmingDelete(false); // Close dialog on success
    } catch (error) {
      console.error("Failed to delete influencer", error);
      // Let the dialog handle showing the error
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end space-x-1">
        <Button variant="ghost" size="icon" onClick={onView} className="h-8 w-8">
          <Eye className="h-4 w-4" />
          <span className="sr-only">Ver detalhes</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Editar</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsConfirmingDelete(true)}
          disabled={isDeleting}
          className="text-destructive hover:text-destructive h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Excluir</span>
        </Button>
      </div>
      <DeleteInfluencerDialog
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={handleDelete}
        influencerName={influencer.name}
        isLoading={isDeleting}
      />
    </>
  );
}
