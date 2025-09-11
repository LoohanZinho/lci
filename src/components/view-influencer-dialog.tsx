"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { InfluencerWithUserData } from "@/lib/influencers";
import { Badge } from "./ui/badge";
import { Flame } from "lucide-react";

interface ViewInfluencerDialogProps {
  influencer: InfluencerWithUserData;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewInfluencerDialog({
  influencer,
  isOpen,
  onClose,
}: ViewInfluencerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {influencer.name}
            {influencer.isFumo && (
              <Badge variant="destructive" className="p-1.5">
                <Flame className="h-4 w-4" />
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>{influencer.instagram}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 text-sm">
           <div className="grid grid-cols-3 gap-2">
             <div className="font-semibold text-muted-foreground">Seguidores</div>
             <div className="col-span-2">{influencer.followers.toLocaleString('pt-BR')}</div>
           </div>
            <div className="grid grid-cols-3 gap-2">
             <div className="font-semibold text-muted-foreground">Nicho</div>
             <div className="col-span-2">{influencer.niche}</div>
           </div>
           <div className="grid grid-cols-3 gap-2">
             <div className="font-semibold text-muted-foreground">Status</div>
             <div className="col-span-2">{influencer.status}</div>
           </div>
           <div className="grid grid-cols-3 gap-2">
             <div className="font-semibold text-muted-foreground">Contato</div>
             <div className="col-span-2">{influencer.contact || 'Não informado'}</div>
           </div>
            <div className="grid grid-cols-3 gap-2">
             <div className="font-semibold text-muted-foreground">Anunciado por</div>
             <div className="col-span-2">
                {influencer.addedByData?.name || 'Anônimo'}
                {influencer.addedByData?.name && influencer.addedByData?.email && <span className="text-muted-foreground text-xs block">({influencer.addedByData.email})</span>}
            </div>
           </div>
           <div className="grid grid-cols-1 gap-2">
             <div className="font-semibold text-muted-foreground">Observações</div>
             <p className="col-span-2 whitespace-pre-wrap">{influencer.notes || 'Nenhuma observação.'}</p>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
