
"use client";

import * as React from "react";
import { Check, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InfluencerWithUserData } from "@/lib/influencers";

interface InfluencerSearchProps {
  influencers: InfluencerWithUserData[];
  onSelect: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export function InfluencerSearch({
  influencers,
  onSelect,
  searchQuery,
  setSearchQuery,
}: InfluencerSearchProps) {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSelect = (currentValue: string) => {
    const influencerName = influencers.find(
      (i) => i.name.toLowerCase() === currentValue
    )?.name;
    if (influencerName) {
      onSelect(influencerName);
    }
    setOpen(false);
  };

  const filteredInfluencers = React.useMemo(() => {
    if (!searchQuery) return influencers.slice(0, 10); // Show some initial results

    const lowercasedQuery = searchQuery.toLowerCase();
    
    return influencers.filter((influencer) => {
        const nameMatch = influencer.name.toLowerCase().includes(lowercasedQuery);
        if (influencer.status === "Contrato fechado") {
            return nameMatch;
        }
        const instagramMatch = influencer.instagram.toLowerCase().includes(lowercasedQuery);
        return nameMatch || instagramMatch;
    }).slice(0, 10);

  }, [searchQuery, influencers]);


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
                ref={inputRef}
                type="text"
                placeholder="Buscar por nome, @, ou nota..."
                className="pl-9 w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setOpen(true)}
            />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
        onOpenAutoFocus={(e) => {
            // Prevent the popover from stealing focus
            e.preventDefault();
            inputRef.current?.focus();
        }}
      >
        <Command shouldFilter={false}>
          <CommandList>
            <CommandEmpty>Nenhum influenciador encontrado.</CommandEmpty>
            <CommandGroup>
              {filteredInfluencers.map((influencer) => (
                <CommandItem
                  key={influencer.id}
                  value={influencer.name.toLowerCase()}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      searchQuery.toLowerCase() === influencer.name.toLowerCase()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <span>{influencer.name} <span className="text-muted-foreground">({influencer.instagram})</span></span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
