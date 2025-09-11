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
import { useEffect, useMemo, useState } from "react";
import { getInfluencers, InfluencerWithUserData } from "@/lib/influencers";
import { Flame } from "lucide-react";
import { InfluencerActions } from "./influencer-actions";
import { EditInfluencerDialog } from "./edit-influencer-dialog";
import { ViewInfluencerDialog } from "./view-influencer-dialog";


interface InfluencerTableProps {
  searchQuery: string;
}

export function InfluencerTable({ searchQuery }: InfluencerTableProps) {
  const [influencers, setInfluencers] = useState<InfluencerWithUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInfluencer, setEditingInfluencer] = useState<InfluencerWithUserData | null>(null);
  const [viewingInfluencer, setViewingInfluencer] = useState<InfluencerWithUserData | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = getInfluencers((data) => {
      setInfluencers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (influencer: InfluencerWithUserData) => {
    setEditingInfluencer(influencer);
  };
  
  const handleView = (influencer: InfluencerWithUserData) => {
    setViewingInfluencer(influencer);
  };

  const filteredInfluencers = useMemo(() => {
    if (!searchQuery) {
      return influencers;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return influencers.filter(
      (influencer) =>
        influencer.name.toLowerCase().includes(lowercasedQuery) ||
        influencer.instagram.toLowerCase().includes(lowercasedQuery) ||
        (influencer.notes &&
          influencer.notes.toLowerCase().includes(lowercasedQuery)) ||
        (influencer.status &&
          influencer.status.toLowerCase().includes(lowercasedQuery))
    );
  }, [influencers, searchQuery]);

  if (loading) {
    return <p>Carregando influenciadores...</p>;
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Influenciador</TableHead>
              <TableHead className="hidden sm:table-cell">Nicho</TableHead>
              <TableHead className="hidden md:table-cell text-center">Seguidores</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="text-center">Fumo</TableHead>
              <TableHead className="text-right hidden lg:table-cell">Última Edição</TableHead>
              <TableHead className="w-[120px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInfluencers.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Nenhum influenciador encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredInfluencers.map((influencer) => (
                <TableRow key={influencer.id}>
                  <TableCell>
                    <div className="font-medium">{influencer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {influencer.instagram}
                    </div>
                     <div className="text-xs text-muted-foreground/80 mt-1">
                      Anunciado por: {influencer.addedByData?.name || 'Desconhecido'}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{influencer.niche}</TableCell>
                   <TableCell className="hidden md:table-cell text-center">{influencer.followers.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="hidden md:table-cell">{influencer.status || "Disponível"}</TableCell>
                  <TableCell className="text-center">
                    {influencer.isFumo && (
                      <Badge variant="destructive" className="p-1.5">
                        <Flame className="h-4 w-4" />
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right hidden lg:table-cell">
                    {influencer.lastUpdate?.toDate().toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <InfluencerActions 
                      influencer={influencer}
                      onEdit={() => handleEdit(influencer)}
                      onView={() => handleView(influencer)}
                    />
                  </TableCell>
                </TableRow>
              ))
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
        />
      )}
    </>
  );
}
