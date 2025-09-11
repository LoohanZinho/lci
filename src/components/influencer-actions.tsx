"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { deleteInfluencer, InfluencerWithUserData } from "@/lib/influencers";
import { useState } from "react";

interface InfluencerActionsProps {
  influencer: InfluencerWithUserData;
  onEdit: () => void;
  onView: () => void;
}

export function InfluencerActions({ influencer, onEdit, onView }: InfluencerActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !window.confirm("Tem certeza que deseja excluir este influenciador?")
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteInfluencer(influencer.id);
    } catch (error) {
      console.error("Failed to delete influencer", error);
      alert("Falha ao excluir o influenciador.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end space-x-1">
       <Button variant="ghost" size="icon" onClick={onView}>
        <Eye className="h-4 w-4" />
        <span className="sr-only">Ver detalhes</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={onEdit}>
        <Edit className="h-4 w-4" />
        <span className="sr-only">Editar</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting} className="text-destructive hover:text-destructive">
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Excluir</span>
      </Button>
    </div>
  );
}
