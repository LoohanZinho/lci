"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { InfluencerForm } from "./influencer-form";
import { Influencer } from "@/lib/influencers";

interface EditInfluencerDialogProps {
  influencer: Influencer;
  isOpen: boolean;
  onClose: () => void;
}

export function EditInfluencerDialog({
  influencer,
  isOpen,
  onClose,
}: EditInfluencerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Influenciador</DialogTitle>
          <DialogDescription>
            Faça alterações nos dados do influenciador. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <InfluencerForm influencer={influencer} onFinished={onClose} />
      </DialogContent>
    </Dialog>
  );
}