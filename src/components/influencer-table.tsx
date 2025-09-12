"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { InfluencerWithUserData } from "@/lib/influencers";
import { Flame, Users } from "lucide-react";
import { InfluencerActions } from "./influencer-actions";
import { EditInfluencerDialog } from "./edit-influencer-dialog";
import { ViewInfluencerDialog, ImageViewer } from "./view-influencer-dialog";
import { useAuth } from "@/hooks/use-auth";
import { getInfluencerClassification, getClassificationBadgeClass } from "@/lib/classification";
import { formatNumber } from "@/lib/utils";


interface InfluencerTableProps {
  influencers: InfluencerWithUserData[];
  loading: boolean;
}

const getInitials = (name: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
}

export function InfluencerTable({ influencers, loading }: InfluencerTableProps) {
  const [editingInfluencer, setEditingInfluencer] = useState<InfluencerWithUserData | null>(null);
  const [viewingInfluencer, setViewingInfluencer] = useState<InfluencerWithUserData | null>(null);
  const { user, isAdmin } = useAuth();
  
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerStartIndex, setImageViewerStartIndex] = useState(0);


  const handleEdit = (influencer: InfluencerWithUserData) => {
    setEditingInfluencer(influencer);
  };
  
  const handleView = (influencer: InfluencerWithUserData) => {
    setViewingInfluencer(influencer);
  };
  
  const handleOpenImageViewer = (influencer: InfluencerWithUserData, index: number) => {
    setViewingInfluencer(influencer); // Make sure the correct influencer data is available
    setImageViewerStartIndex(index);
    setImageViewerOpen(true);
  };

  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    // We don't reset viewingInfluencer here in case the details dialog is still open
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando influenciadores...</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Influenciador</TableHead>
              <TableHead className="hidden sm:table-cell text-center">Classificação</TableHead>
              <TableHead className="hidden md:table-cell">Seguidores</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="text-center">Fumo</TableHead>
              <TableHead className="text-right hidden lg:table-cell">Última Edição</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {influencers.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Nenhum influenciador encontrado.
                </TableCell>
              </TableRow>
            ) : (
              influencers.map((influencer) => {
                const classification = getInfluencerClassification(influencer.followers);
                
                const isOwner = user?.uid === influencer.addedBy;
                const posterIsAnonymous = influencer.addedByData?.isAnonymous;
                
                let addedByName: string;
                if (isOwner) {
                  addedByName = 'Você';
                } else if (!posterIsAnonymous || isAdmin) {
                  addedByName = influencer.addedByData?.name || 'Anônimo';
                } else {
                  addedByName = 'Anônimo';
                }

                return (
                <TableRow key={influencer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/20 text-primary font-bold">
                          {getInitials(influencer.name)}
                        </div>
                        <div>
                            <div className="font-medium">{influencer.name}</div>
                            <div className="text-sm text-muted-foreground">
                            {influencer.instagram}
                            </div>
                            <div className="text-xs text-muted-foreground/80 mt-1">
                            Anunciado por: {addedByName}
                            </div>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    <Badge variant="outline" className={getClassificationBadgeClass(classification)}>
                      {classification}
                    </Badge>
                  </TableCell>
                   <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{formatNumber(influencer.followers)}</span>
                    </div>
                   </TableCell>
                  <TableCell className="hidden md:table-cell">{influencer.status || "Desconhecido"}</TableCell>
                  <TableCell className="text-center">
                    {influencer.isFumo && (
                      <Badge variant="destructive" className="p-1.5">
                        <Flame className="h-4 w-4" />
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right hidden lg:table-cell">
                    {influencer.lastUpdate?.toDate().toLocaleString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <InfluencerActions 
                      influencer={influencer}
                      onEdit={() => handleEdit(influencer)}
                      onView={() => handleView(influencer)}
                    />
                  </TableCell>
                </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {editingInfluencer && (
        <EditInfluencerDialog
          influencer={editingInfluencer}
          isOpen={!!editingInfluencer}
          onClose={() => setEditingInfluencer(null)}
        />
      )}

      {viewingInfluencer && (
        <ViewInfluencerDialog
          influencer={viewingInfluencer}
          isOpen={!!viewingInfluencer}
          onClose={() => setViewingInfluencer(null)}
          onOpenImageViewer={(index) => handleOpenImageViewer(viewingInfluencer, index)}
        />
      )}
      
      {imageViewerOpen && viewingInfluencer && viewingInfluencer.proofImageUrls && (
         <ImageViewer
            images={viewingInfluencer.proofImageUrls}
            startIndex={imageViewerStartIndex}
            onClose={handleCloseImageViewer}
        />
      )}
    </>
  );
}
