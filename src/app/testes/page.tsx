"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TestesPage() {
  const [instagram, setInstagram] = useState("");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Página de Testes</h1>
      <p className="mb-6">Esta página está pronta para seus testes.</p>
      
      <div className="max-w-sm space-y-2">
        <Label htmlFor="instagram-test">Instagram</Label>
        <div className="flex h-10 w-full items-center rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <span className="text-muted-foreground">@</span>
            <Input 
                id="instagram-test" 
                placeholder="username" 
                value={instagram} 
                onChange={(e) => setInstagram(e.target.value.replace(/@/g, ''))} 
                className="border-0 bg-transparent p-0 pl-1 focus-visible:ring-0 focus-visible:ring-offset-0" 
            />
        </div>
        <p className="text-sm text-muted-foreground">
            Valor atual: @{instagram}
        </p>
      </div>
    </div>
  );
}
