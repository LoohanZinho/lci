'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Search, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  validateProfileName,
  ValidateProfileNameOutput,
} from '@/ai/flows/profile-search';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const formSchema = z.object({
  username: z.string().min(1, {
    message: 'O nome de usuário não pode estar em branco.',
  }),
});

export function ProfileSearch() {
  const [result, setResult] = useState<ValidateProfileNameOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await validateProfileName({ username: values.username });
      if (response.isValid) {
        setResult(response);
      } else {
        setResult(null); // Clear previous results
        toast({
          variant: 'destructive',
          title: 'Perfil não encontrado',
          description: `O nome de usuário "@${values.username}" não foi encontrado.`,
        });
      }
    } catch (error) {
      console.error(error);
      setResult(null); // Clear previous results
      toast({
        variant: 'destructive',
        title: 'Ocorreu um erro',
        description:
          'Não foi possível buscar o perfil. Por favor, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const profilePicData = PlaceHolderImages.find((p) => p.id === 'profile-pic-1');

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">
                      Nome de usuário do Instagram
                    </FormLabel>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        @
                      </span>
                      <FormControl>
                        <Input
                          placeholder="instagram_user"
                          className="pl-8"
                          {...field}
                          aria-label="Nome de usuário do Instagram"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Buscar Perfil
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result?.isValid && (
        <Card className="animate-in fade-in-50 overflow-hidden bg-card/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <div className="relative h-40 w-40">
              <Image
                src={
                  profilePicData?.imageUrl ||
                  'https://picsum.photos/seed/default/400/400'
                }
                alt={`Foto de perfil de ${form.getValues('username')}`}
                className="rounded-full border-4 border-background object-cover"
                fill
                sizes="160px"
                data-ai-hint={profilePicData?.imageHint || 'portrait'}
              />
            </div>
            <p className="text-xl font-semibold text-foreground">
              @{form.getValues('username')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
