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
import { getInfluencers, Influencer } from "@/lib/influencers";
import { Flame } from "lucide-react";
import { InfluencerActions } from "./influencer-actions";

interface InfluencerTableProps {
  searchQuery: string;
}

export function InfluencerTable({ searchQuery }: InfluencerTableProps) {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = getInfluencers((data) => {
      setInfluencers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Influenciador</TableHead>
            <TableHead>Nicho</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Fumo</TableHead>
            <TableHead className="text-right">Última Edição</TableHead>
            <TableHead className="w-[80px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInfluencers.length === 0 && !loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
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
                </TableCell>
                <TableCell>{influencer.niche}</TableCell>
                <TableCell>{influencer.status || "Disponível"}</TableCell>
                <TableCell className="text-center">
                  {influencer.isFumo && (
                    <Badge variant="destructive" className="p-1.5">
                      <Flame className="h-4 w-4" />
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {influencer.lastUpdate?.toDate().toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell className="text-right">
                   <InfluencerActions influencerId={influencer.id} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
