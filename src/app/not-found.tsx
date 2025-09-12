import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <AlertTriangle className="h-16 w-16 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">404 - Página Não Encontrada</h1>
        <p className="text-muted-foreground max-w-md">
          Oops! A página que você está procurando não existe ou foi movida para outro local.
        </p>
        <Button asChild className="mt-4" variant="gold">
          <Link href="/">Voltar para a Página Inicial</Link>
        </Button>
      </div>
    </div>
  );
}
