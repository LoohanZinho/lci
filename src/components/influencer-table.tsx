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

// Dados de exemplo
const influencers = [
  {
    id: "1",
    name: "João Silva",
    instagram: "@joaosilva",
    status: "Fechado com Zé",
    isFumo: true,
    lastUpdate: "2024-07-28",
  },
  {
    id: "2",
    name: "Maria Oliveira",
    instagram: "@maria.o",
    status: "Disponível",
    isFumo: false,
    lastUpdate: "2024-07-27",
  },
  {
    id: "3",
    name: "Ana Costa",
    instagram: "@anacostaa",
    status: "Fechado (anônimo)",
    isFumo: false,
    lastUpdate: "2024-07-25",
  },
  {
    id: "4",
    name: "Carlos Pereira",
    instagram: "@carlos.p",
    status: "Disponível",
    isFumo: false,
    lastUpdate: "2024-07-22",
  },
];

export function InfluencerTable() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Influenciador</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Fumo</TableHead>
            <TableHead className="text-right">Última Edição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {influencers.map((influencer) => (
            <TableRow key={influencer.id}>
              <TableCell>
                <div className="font-medium">{influencer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {influencer.instagram}
                </div>
              </TableCell>
              <TableCell>{influencer.status}</TableCell>
              <TableCell className="text-center">
                {influencer.isFumo && (
                  <Badge variant="destructive">Sim</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {new Date(influencer.lastUpdate).toLocaleDateString("pt-BR")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
