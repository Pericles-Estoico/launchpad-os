import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MarketplaceBadge } from '@/components/common/MarketplaceBadge';
import { GateStatusBadge } from '@/components/common/GateStatusBadge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useAppStore } from '@/store/useAppStore';
import { MarketplaceKey, MARKETPLACE_CONFIG, GateRun } from '@/lib/types';
import { 
  CheckCircle2, 
  Circle, 
  FileText, 
  Upload, 
  ExternalLink,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function StoresPage() {
  const { gateRuns, requirements, workspace } = useAppStore();
  const [activeTab, setActiveTab] = useState<MarketplaceKey>('mercadolivre');

  const wave1Marketplaces: MarketplaceKey[] = ['mercadolivre', 'shopee'];

  const getMarketplaceProgress = (marketplace: MarketplaceKey) => {
    const gates = gateRuns.filter(g => g.marketplaceKey === marketplace);
    const approved = gates.filter(g => g.status === 'approved').length;
    return {
      approved,
      total: gates.length,
      percentage: Math.round((approved / gates.length) * 100),
    };
  };

  const getMarketplaceReqs = (marketplace: MarketplaceKey) => {
    return requirements.find(r => r.marketplaceKey === marketplace);
  };

  const mlProgress = getMarketplaceProgress('mercadolivre');
  const shopeeProgress = getMarketplaceProgress('shopee');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lojas (Wave 1)</h1>
          <p className="text-muted-foreground">
            Onboarding de lojas nos marketplaces
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {workspace.cnpj}
        </Badge>
      </div>

      {/* Marketplace Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MarketplaceKey)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          {wave1Marketplaces.map((mp) => {
            const progress = getMarketplaceProgress(mp);
            return (
              <TabsTrigger key={mp} value={mp} className="gap-2">
                <MarketplaceBadge marketplace={mp} size="sm" />
                <span className="text-xs text-muted-foreground">
                  {progress.percentage}%
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {wave1Marketplaces.map((marketplace) => {
          const progress = getMarketplaceProgress(marketplace);
          const reqs = getMarketplaceReqs(marketplace);
          const gates = gateRuns.filter(g => g.marketplaceKey === marketplace).sort((a, b) => a.order - b.order);

          return (
            <TabsContent key={marketplace} value={marketplace} className="space-y-6 mt-6">
              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MarketplaceBadge marketplace={marketplace} />
                        Progresso de Onboarding
                      </CardTitle>
                      <CardDescription>
                        {progress.approved} de {progress.total} gates completos
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{progress.percentage}%</p>
                      <p className="text-sm text-muted-foreground">Completo</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ProgressBar value={progress.percentage} className="h-3" />
                </CardContent>
              </Card>

              {/* Gates Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gates de Onboarding</CardTitle>
                  <CardDescription>
                    Complete cada etapa para avançar no processo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    
                    <div className="space-y-4">
                      {gates.map((gate, index) => {
                        const isLocked = gate.status === 'locked';
                        const isActive = gate.status === 'in_progress' || gate.status === 'submitted';
                        const isCompleted = gate.status === 'approved';
                        const isRejected = gate.status === 'rejected';

                        return (
                          <div 
                            key={gate.id}
                            className={cn(
                              'relative pl-10',
                              isLocked && 'opacity-50'
                            )}
                          >
                            {/* Timeline dot */}
                            <div className={cn(
                              'absolute left-2 top-1 h-5 w-5 rounded-full border-2 flex items-center justify-center bg-card',
                              isCompleted && 'border-success bg-success',
                              isActive && 'border-primary bg-primary',
                              isRejected && 'border-destructive bg-destructive',
                              isLocked && 'border-muted-foreground',
                            )}>
                              {isCompleted && <CheckCircle2 className="h-3 w-3 text-success-foreground" />}
                              {isActive && <Circle className="h-3 w-3 text-primary-foreground animate-pulse" />}
                              {isRejected && <AlertCircle className="h-3 w-3 text-destructive-foreground" />}
                              {isLocked && <Lock className="h-2.5 w-2.5 text-muted-foreground" />}
                            </div>

                            {/* Gate card */}
                            <div className={cn(
                              'rounded-lg border p-4 transition-all',
                              isActive && 'ring-2 ring-primary/20 border-primary',
                              isCompleted && 'border-success/30 bg-success/5',
                              isRejected && 'border-destructive/30 bg-destructive/5',
                            )}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{gate.gateName}</span>
                                    <GateStatusBadge status={gate.status} />
                                  </div>
                                  {gate.rejectionReason && (
                                    <p className="mt-1 text-sm text-destructive">
                                      Motivo: {gate.rejectionReason}
                                    </p>
                                  )}
                                </div>
                                {!isLocked && !isCompleted && (
                                  <Button size="sm" variant={isActive ? 'default' : 'outline'}>
                                    {isActive ? 'Continuar' : 'Ver detalhes'}
                                  </Button>
                                )}
                              </div>

                              {/* Evidence info */}
                              {gate.evidence.length > 0 && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                  <FileText className="h-3.5 w-3.5" />
                                  {gate.evidence.length} evidência(s) anexada(s)
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              {reqs && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Requisitos Documentais</CardTitle>
                    <CardDescription>
                      Documentos necessários para operar neste marketplace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {reqs.requirements.map((req) => (
                        <div 
                          key={req.key}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-full',
                              req.status === 'verified' && 'bg-success/10 text-success',
                              req.status === 'uploaded' && 'bg-warning/10 text-warning',
                              req.status === 'missing' && 'bg-muted text-muted-foreground',
                            )}>
                              {req.status === 'verified' && <CheckCircle2 className="h-4 w-4" />}
                              {req.status === 'uploaded' && <Upload className="h-4 w-4" />}
                              {req.status === 'missing' && <FileText className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{req.name}</p>
                              <p className="text-xs text-muted-foreground">{req.desc}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              req.status === 'verified' && 'status-success',
                              req.status === 'uploaded' && 'status-warning',
                              req.status === 'missing' && 'status-neutral',
                            )}
                          >
                            {req.status === 'verified' && 'Verificado'}
                            {req.status === 'uploaded' && 'Enviado'}
                            {req.status === 'missing' && 'Pendente'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
