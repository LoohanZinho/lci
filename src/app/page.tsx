import { ProfileSearch } from '@/components/profile-search';
import { Instagram } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Instagram className="h-8 w-8" />
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground">
            InstaSnap
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Digite um nome de usuário do Instagram para ver a foto do perfil.
          </p>
        </div>
        <ProfileSearch />
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Dica: O perfil de teste é 'exists'. Outros nomes de usuário podem não
            ser encontrados.
          </p>
        </div>
      </div>
    </main>
  );
}
