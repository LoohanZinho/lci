
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditorData } from "@/lib/influencers";
import { useAuth } from "@/hooks/use-auth";

interface ViewChangesDialogProps {
  editor: EditorData;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewChangesDialog({
  editor,
  isOpen,
  onClose,
}: ViewChangesDialogProps) {
  const { isAdmin } = useAuth();
  const editorName = (editor.isAnonymous && !isAdmin) ? "Anônimo" : editor.name;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Histórico de Alterações</DialogTitle>
          <DialogDescription>
            Alterações feitas por {editorName} em{" "}
            {editor.timestamp?.toDate().toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campo</TableHead>
                <TableHead>Valor Antigo</TableHead>
                <TableHead>Novo Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editor.changes.map((change, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{change.field}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <span className="line-through">{change.oldValue}</span>
                  </TableCell>
                  <TableCell className="text-primary font-semibold">
                    {change.newValue}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
