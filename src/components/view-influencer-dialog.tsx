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
import { Flame, UserCircle, Edit } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import { getInfluencerClassification, getClassificationBadgeClass } from "@/lib/classification";

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
  const { user, isAdmin } = useAuth();
  
  const classification = getInfluencerClassification(influencer.followers);

  const getAddedByName = () => {
    if (influencer.addedBy === user?.uid) {
      return "Você";
    }
    if (isAdmin) {
      return influencer.addedByData?.name || "Anônimo";
    }
    if (influencer.addedByData?.isAnonymous) {
      return "Anônimo";
    }
    return influencer.addedByData?.name || "Anônimo";
  }

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
            <DetailRow label="Classificação" value={
              <Badge variant="outline" className={getClassificationBadgeClass(classification)}>{classification}</Badge>
            } />
            <DetailRow label="Seguidores" value={influencer.followers.toLocaleString('pt-BR')} />
            <DetailRow label="Nicho" value={influencer.niche || 'Não informado'} />
            <DetailRow label="Status" value={influencer.status} />
            <DetailRow label="Contato" value={influencer.contact || 'Não informado'} />
            <DetailRow label="Observações" value={
                <p className="whitespace-pre-wrap">{influencer.notes || 'Nenhuma observação.'}</p>
            } />
             <DetailRow label="Última Edição" value={influencer.lastUpdate?.toDate().toLocaleString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) || 'N/A'} />

             {influencer.proofImageUrls && influencer.proofImageUrls.length > 0 && (
                <div className="py-3 border-b border-border/50">
                    <span className="font-semibold text-muted-foreground mb-2 block">Provas</span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {influencer.proofImageUrls.map((url, index) => (
                             <div key={index} className="relative w-full aspect-video rounded-md overflow-hidden">
                                <Image src={url} alt={`Prova ${index + 1} para ${influencer.name}`} layout="fill" objectFit="contain" />
                            </div>
                        ))}
                    </div>
                </div>
             )}

            <div className="py-3">
              <h4 className="font-semibold text-muted-foreground mb-3">Linha do Tempo de Edições</h4>
              <div className="space-y-3">
                  <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserCircle className="h-5 w-5" />
                      </div>
                      <div>
                          <p className="font-medium">
                            Adicionado por {getAddedByName()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {influencer.lastUpdate?.toDate().toLocaleString("pt-BR", { day: '2-digit', month: 'numeric', year: 'numeric' })}
                          </p>
                      </div>
                  </div>
                  {influencer.editorsData && influencer.editorsData
                    .filter(editor => !editor.isAnonymous)
                    .map((editor, index) => (
                      <div key={index} className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                            <Edit className="h-4 w-4" />
                          </div>
                          <div>
                              <p className="font-medium">
                                Editado por {editor.name}
                              </p>
                          </div>
                      </div>
                  ))}
                   <div className="text-center text-xs text-muted-foreground/80 pt-2">
                      Apenas edições de usuários não-anônimos são exibidas.
                  </div>
              </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
