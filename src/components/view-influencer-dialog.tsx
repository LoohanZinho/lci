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
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

interface ViewInfluencerDialogProps {
  influencer: InfluencerWithUserData;
  isOpen: boolean;
  onClose: () => void;
}

const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="grid grid-cols-3 items-start gap-4 py-3 border-b border-border/50">
        <span className="font-semibold text-muted-foreground">{label}</span>
        <div className="col-span-2 text-foreground">{value}</div>
    </div>
);


export function ViewInfluencerDialog({
  influencer,
  isOpen,
  onClose,
}: ViewInfluencerDialogProps) {
  const { isAdmin } = useAuth();
  
  const getAddedByName = () => {
    if (isAdmin) {
      return influencer.addedByData?.name || 'Anônimo (Admin View)';
    }
    return influencer.addedByData?.name || 'Anônimo';
  }

  const getAddedByEmail = () => {
    if (isAdmin) {
      return influencer.addedByData?.email || null;
    }
    // Only show email if the user is not anonymous
    return influencer.addedByData?.name ? influencer.addedByData?.email : null;
  }

  const addedByName = getAddedByName();
  const addedByEmail = getAddedByEmail();


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {influencer.name}
            {influencer.isFumo && (
              <Badge variant="destructive" className="p-1 rounded-full">
                <Flame className="h-4 w-4" />
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>{influencer.instagram}</DialogDescription>
        </DialogHeader>
        <div className="text-sm">
            <DetailRow label="Seguidores" value={influencer.followers.toLocaleString('pt-BR')} />
            <DetailRow label="Nicho" value={influencer.niche || 'Não informado'} />
            <DetailRow label="Status" value={influencer.status} />
            <DetailRow label="Contato" value={influencer.contact || 'Não informado'} />
            <DetailRow label="Anunciado por" value={
                <div>
                    {addedByName}
                    {addedByEmail && 
                        <span className="text-muted-foreground text-xs block">({addedByEmail})</span>
                    }
                </div>
            } />
            <DetailRow label="Observações" value={
                <p className="whitespace-pre-wrap">{influencer.notes || 'Nenhuma observação.'}</p>
            } />
             <DetailRow label="Última Edição" value={influencer.lastUpdate?.toDate().toLocaleString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) || 'N/A'} />

             {influencer.proofImageUrl && (
                <div className="py-3">
                    <span className="font-semibold text-muted-foreground">Prova</span>
                    <div className="mt-2 relative w-full aspect-video rounded-md overflow-hidden">
                        <Image src={influencer.proofImageUrl} alt={`Prova para ${influencer.name}`} layout="fill" objectFit="contain" />
                    </div>
                </div>
             )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
