import { BookUser } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <BookUser className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Mural de Influência</h1>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-semibold mb-4">Bem-vindo ao Mural</h2>
        <p className="text-muted-foreground">
          Aqui você poderá registrar e consultar influenciadores, ver histórico de campanhas e muito mais.
        </p>
      </main>
    </div>
  );
}
