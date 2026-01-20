import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Store, AlertCircle, Rocket } from 'lucide-react';

export default function OnboardingPage() {
  const [workspaceName, setWorkspaceName] = useState('');
  const { profile } = useAuth();
  const { createWorkspace, isCreating, error } = useOnboarding();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (workspaceName.trim()) {
      createWorkspace(workspaceName.trim());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo, {profile?.name}!</CardTitle>
          <CardDescription>
            Vamos configurar seu workspace para começar a vender em marketplaces
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="workspaceName">Nome da sua empresa/marca</Label>
              <Input
                id="workspaceName"
                type="text"
                placeholder="Ex: ModaFlex Brasil"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
                disabled={isCreating}
              />
              <p className="text-xs text-muted-foreground">
                Este será o nome do seu workspace. Você pode alterar depois nas configurações.
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-3">
              <h4 className="font-medium text-sm">O que será configurado:</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" />
                  Gates de onboarding para Mercado Livre e Shopee
                </li>
                <li className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" />
                  Biblioteca de requisitos documentais
                </li>
                <li className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" />
                  Estrutura de catálogo e anúncios
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isCreating || !workspaceName.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando workspace...
                </>
              ) : (
                'Criar workspace e começar'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
