"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EditorData, InfluencerWithUserData } from "@/lib/influencers";
import { Badge } from "./ui/badge";
import { Flame, UserCircle, Edit, ShieldAlert, Package, Calendar, Eye, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import { getInfluencerClassification, getClassificationBadgeClass } from "@/lib/classification";
import { useState } from "react";
import { ViewChangesDialog } from "./view-changes-dialog";
import { Button } from "./ui/button";

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


function ImageViewer({ images, startIndex, onClose }: { images: string[], startIndex: number, onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full h-full max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <Image
          src={images[currentIndex]}
          alt={`Prova ampliada ${currentIndex + 1}`}
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>
       <Button variant="ghost" size="icon" className="fixed top-4 right-4 text-white h-10 w-10" onClick={onClose}>
        <X className="h-6 w-6" />
      </Button>
      {images.length > 1 && (
        <>
          <Button variant="ghost" size="icon" className="fixed left-4 top-1/2 -translate-y-1/2 text-white h-12 w-12" onClick={goToPrevious}>
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button variant="ghost" size="icon" className="fixed right-4 top-1/2 -translate-y-1/2 text-white h-12 w-12" onClick={goToNext}>
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}
    </div>
  );
}


export function ViewInfluencerDialog({
  influencer,
  isOpen,
  onClose,
}: ViewInfluencerDialogProps) {
  const { user, isAdmin } = useAuth();
  const [selectedEdit, setSelectedEdit] = useState<EditorData | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerStartIndex, setImageViewerStartIndex] = useState(0);

  const openImageViewer = (index: number) => {
    setImageViewerStartIndex(index);
    setImageViewerOpen(true);
  };
  
  const classification = getInfluencerClassification(influencer.followers);

  const getAddedByName = () => {
    if (influencer.addedBy === user?.uid) {
      return "Você";
    }
    if (influencer.addedByData?.isAnonymous && !isAdmin) {
      return "Anônimo";
    }
    return influencer.addedByData?.name || "Anônimo";
  }
  
  const posterIsAnonymous = influencer.addedByData?.isAnonymous;

  return (
    <>
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
            {influencer.status === 'Prejuízo' && influencer.lossReason && (
              <DetailRow label="Motivo Prejuízo" value={
                <p className="whitespace-pre-wrap">{influencer.lossReason}</p>
              } />
            )}
            <DetailRow label="Observações" value={
                <p className="whitespace-pre-wrap">{influencer.notes || 'Nenhuma observação.'}</p>
            } />

             {influencer.products && influencer.products.length > 0 && (
                <div className="py-3 border-b border-border/50">
                    <span className="font-semibold text-muted-foreground mb-2 block">Histórico de Produtos</span>
                    <div className="space-y-3">
                        {influencer.products.map((product, index) => (
                             <div key={index} className="flex items-start gap-3">
                                <Package className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" />
                                        {product.addedAt?.toDate().toLocaleString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric' }) || 'Data não registrada'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             )}

             {influencer.proofImageUrls && influencer.proofImageUrls.length > 0 && (
                <div className="py-3 border-b border-border/50">
                    <span className="font-semibold text-muted-foreground mb-2 block">Provas</span>
                    <div className="grid grid-cols-2 gap-2">
                        {influencer.proofImageUrls.map((url, index) => (
                             <button key={index} onClick={() => openImageViewer(index)} className="relative w-full aspect-square rounded-md overflow-hidden group border">
                                <Image src={url} alt={`Prova ${index + 1} para ${influencer.name}`} fill style={{ objectFit: 'cover' }} />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Eye className="h-6 w-6 text-white" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
             )}

            <div className="py-3">
              <h4 className="font-semibold text-muted-foreground mb-3">Linha do Tempo de Edições</h4>
              <div className="space-y-4">
                  <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserCircle className="h-5 w-5" />
                      </div>
                       <div>
                          <p className="font-medium">
                            Adicionado por {getAddedByName()}
                          </p>
                           {isAdmin && (
                            <>
                              <p className="text-xs text-muted-foreground">{influencer.addedByData?.email}</p>
                              {posterIsAnonymous && (
                                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                                  <ShieldAlert className="h-3 w-3" />
                                  <span>Modo Anônimo Ativado</span>
                                </div>
                              )}
                            </>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            em {influencer.lastUpdate?.toDate().toLocaleString("pt-BR", { day: '2-digit', month: 'numeric', year: 'numeric' })}
                          </p>
                      </div>
                  </div>
                  {influencer.editorsData && influencer.editorsData
                    .map((editor, index) => {
                      const editorName = (editor.isAnonymous && !isAdmin) ? "Anônimo" : editor.name;

                      return (
                      <div key={index} className="flex items-start gap-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                            <Edit className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                              <p className="font-medium">
                                Editado por {editorName}
                              </p>
                               {isAdmin && (
                                <>
                                  <p className="text-xs text-muted-foreground">{editor.email}</p>
                                  {editor.isAnonymous && (
                                     <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                                      <ShieldAlert className="h-3 w-3" />
                                      <span>Modo Anônimo Ativado</span>
                                    </div>
                                  )}
                                </>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                em {editor.timestamp?.toDate().toLocaleString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) || 'N/A'}
                              </p>
                          </div>
                          {editor.changes?.length > 0 && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedEdit(editor)}>
                                <Eye className="h-4 w-4" />
                            </Button>
                          )}
                      </div>
                      )
                    })}
                   {(!influencer.editorsData || influencer.editorsData.length === 0) && (
                     <div className="text-center text-xs text-muted-foreground/80 pt-2">
                        Nenhuma edição registrada.
                    </div>
                   )}
              </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
    {imageViewerOpen && (
      <ImageViewer 
        images={influencer.proofImageUrls} 
        startIndex={imageViewerStartIndex} 
        onClose={() => setImageViewerOpen(false)} 
      />
    )}
     {selectedEdit && (
        <ViewChangesDialog
            isOpen={!!selectedEdit}
            onClose={() => setSelectedEdit(null)}
            editor={selectedEdit}
        />
     )}
     </>
  );
}
