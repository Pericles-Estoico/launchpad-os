import { 
  Store, 
  Package, 
  FileText, 
  Swords, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { KPICard } from '@/components/common/KPICard';
import { MarketplaceBadge } from '@/components/common/MarketplaceBadge';
import { GateStatusBadge } from '@/components/common/GateStatusBadge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { 
    products, 
    gateRuns, 
    listingDrafts, 
    warTasks, 
    activities,
    merchantFeedRows 
  } = useAppStore();

  // Calculate KPIs
  const approvedGates = gateRuns.filter(g => g.status === 'approved').length;
  const totalGates = gateRuns.length;
  const gateProgress = Math.round((approvedGates / totalGates) * 100);

  const readyListings = listingDrafts.filter(l => l.readiness.ready).length;
  const totalListings = listingDrafts.length;

  const todayTasks = warTasks.filter(t => t.status !== 'done').length;
  const completedTasks = warTasks.filter(t => t.status === 'done').length;

  const validFeeds = merchantFeedRows.filter(f => f.validation.valid).length;
  const totalFeeds = merchantFeedRows.length;

  // Quick actions based on current state
  const pendingGates = gateRuns.filter(g => g.status === 'submitted');
  const blockedListings = listingDrafts.filter(l => !l.readiness.ready);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do lançamento nos marketplaces
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Gates Aprovados"
          value={`${approvedGates}/${totalGates}`}
          subtitle={`${gateProgress}% completo`}
          icon={CheckCircle2}
          trend={{ value: 12, positive: true }}
        />
        <KPICard
          title="Produtos Cadastrados"
          value={products.length}
          subtitle={`${products.filter(p => p.mediaSetId).length} com mídia`}
          icon={Package}
        />
        <KPICard
          title="Anúncios Prontos"
          value={`${readyListings}/${totalListings}`}
          subtitle={blockedListings.length > 0 ? `${blockedListings.length} com bloqueios` : 'Todos prontos!'}
          icon={FileText}
        />
        <KPICard
          title="Tarefas Hoje"
          value={todayTasks}
          subtitle={`${completedTasks} concluídas`}
          icon={Swords}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gate Progress */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-medium">Progresso por Marketplace</CardTitle>
              <CardDescription>Status dos gates de onboarding</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/gates" className="gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {(['mercadolivre', 'shopee'] as const).map((marketplace) => {
              const marketplaceGates = gateRuns.filter(g => g.marketplaceKey === marketplace);
              const approved = marketplaceGates.filter(g => g.status === 'approved').length;
              const progress = Math.round((approved / marketplaceGates.length) * 100);
              const currentGate = marketplaceGates.find(g => 
                g.status === 'in_progress' || g.status === 'submitted'
              );

              return (
                <div key={marketplace} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MarketplaceBadge marketplace={marketplace} />
                      <span className="text-sm text-muted-foreground">
                        {approved}/{marketplaceGates.length} gates
                      </span>
                    </div>
                    {currentGate && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {currentGate.gateName}
                        </span>
                        <GateStatusBadge status={currentGate.status} showLabel={false} />
                      </div>
                    )}
                  </div>
                  <ProgressBar value={progress} showLabel />
                </div>
              );
            })}

            {/* Wave 2 Preview */}
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm font-medium text-muted-foreground mb-2">Wave 2 (Em breve)</p>
              <div className="flex gap-2 flex-wrap">
                {(['shein', 'tiktok', 'kwai', 'amazon'] as const).map((mp) => (
                  <MarketplaceBadge key={mp} marketplace={mp} size="sm" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    activity.type === 'gate_approved' && 'bg-success/10 text-success',
                    activity.type === 'gate_rejected' && 'bg-destructive/10 text-destructive',
                    activity.type === 'product_created' && 'bg-info/10 text-info',
                    activity.type === 'listing_ready' && 'bg-primary/10 text-primary',
                    activity.type === 'ai_run' && 'bg-purple-100 text-purple-600',
                    !['gate_approved', 'gate_rejected', 'product_created', 'listing_ready', 'ai_run'].includes(activity.type) && 'bg-muted text-muted-foreground'
                  )}>
                    {activity.type === 'gate_approved' && <CheckCircle2 className="h-4 w-4" />}
                    {activity.type === 'gate_rejected' && <AlertCircle className="h-4 w-4" />}
                    {activity.type === 'product_created' && <Package className="h-4 w-4" />}
                    {activity.type === 'listing_ready' && <FileText className="h-4 w-4" />}
                    {activity.type === 'ai_run' && <TrendingUp className="h-4 w-4" />}
                    {!['gate_approved', 'gate_rejected', 'product_created', 'listing_ready', 'ai_run'].includes(activity.type) && <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      {(pendingGates.length > 0 || blockedListings.length > 0) && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <CardTitle className="text-base font-medium">Ações Pendentes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pendingGates.map((gate) => (
                <div key={gate.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2">
                    <MarketplaceBadge marketplace={gate.marketplaceKey} size="sm" />
                    <span className="text-sm">{gate.gateName}</span>
                  </div>
                  <GateStatusBadge status={gate.status} showLabel={false} />
                </div>
              ))}
              {blockedListings.slice(0, 3).map((listing) => (
                <div key={listing.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2">
                    <MarketplaceBadge marketplace={listing.marketplaceKey} size="sm" />
                    <span className="text-sm truncate max-w-[120px]">{listing.copy.title_short.slice(0, 20)}...</span>
                  </div>
                  <span className="text-xs text-destructive">{listing.readiness.blockers.length} bloqueios</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/products">
            <Package className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/ai-studio">
            <TrendingUp className="mr-2 h-4 w-4" />
            Abrir AI Studio
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/war-room">
            <Swords className="mr-2 h-4 w-4" />
            Ver War Room
          </Link>
        </Button>
      </div>
    </div>
  );
}
