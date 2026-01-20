import { useState } from 'react';
import { 
  Swords, 
  Plus, 
  Filter,
  CheckCircle2,
  Clock,
  Circle,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore, getRoleLabel, getRoleColor } from '@/store/useAppStore';
import { MarketplaceBadge } from '@/components/common/MarketplaceBadge';
import { WarTask, WarTaskStatus, MarketplaceKey } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const taskTypeLabels: Record<WarTask['type'], { label: string; color: string }> = {
  setup: { label: 'Setup', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  listing: { label: 'Anúncio', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  merchant: { label: 'Merchant', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  optimization: { label: 'Otimização', color: 'bg-green-100 text-green-700 border-green-200' },
};

const priorityColors: Record<number, string> = {
  1: 'bg-destructive text-destructive-foreground',
  2: 'bg-warning text-warning-foreground',
  3: 'bg-info text-info-foreground',
  4: 'bg-muted text-muted-foreground',
  5: 'bg-muted text-muted-foreground',
};

export default function WarRoomPage() {
  const { warTasks, updateWarTask, currentUser } = useAppStore();
  const [filterMarketplace, setFilterMarketplace] = useState<MarketplaceKey | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<WarTaskStatus | 'all'>('all');

  const filteredTasks = warTasks.filter((task) => {
    const matchesMarketplace = filterMarketplace === 'all' || task.marketplaceKey === filterMarketplace;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesMarketplace && matchesStatus;
  }).sort((a, b) => {
    // Sort by priority first, then by impact
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.impact - a.impact;
  });

  const todoTasks = filteredTasks.filter(t => t.status === 'todo');
  const doingTasks = filteredTasks.filter(t => t.status === 'doing');
  const doneTasks = filteredTasks.filter(t => t.status === 'done');

  const totalImpact = todoTasks.reduce((sum, t) => sum + t.impact, 0) + doingTasks.reduce((sum, t) => sum + t.impact, 0);

  const handleStatusChange = (taskId: string, newStatus: WarTaskStatus) => {
    updateWarTask(taskId, { status: newStatus });
    if (newStatus === 'done') {
      toast.success('Tarefa concluída! 🎉');
    }
  };

  const TaskCard = ({ task }: { task: WarTask }) => {
    const typeConfig = taskTypeLabels[task.type];
    const canEdit = currentUser.role === 'admin' || currentUser.role === task.ownerRole;

    return (
      <div className={cn(
        'rounded-lg border bg-card p-4 transition-all hover:shadow-md',
        task.status === 'done' && 'opacity-60'
      )}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MarketplaceBadge marketplace={task.marketplaceKey} size="sm" />
              <Badge variant="outline" className={typeConfig.color}>
                {typeConfig.label}
              </Badge>
              <Badge className={cn('text-xs', priorityColors[task.priority])}>
                P{task.priority}
              </Badge>
            </div>
            <p className="font-medium">{task.title}</p>
            {task.notes && (
              <p className="text-sm text-muted-foreground mt-1">{task.notes}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="outline" className={getRoleColor(task.ownerRole)}>
                {getRoleLabel(task.ownerRole)}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                Impacto: {task.impact}
              </div>
            </div>
          </div>
          {canEdit && task.status !== 'done' && (
            <Button 
              size="sm" 
              variant={task.status === 'todo' ? 'outline' : 'default'}
              onClick={() => handleStatusChange(
                task.id, 
                task.status === 'todo' ? 'doing' : 'done'
              )}
            >
              {task.status === 'todo' ? 'Iniciar' : 'Concluir'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Swords className="h-6 w-6" />
            War Room
          </h1>
          <p className="text-muted-foreground">
            Tarefas diárias para impulsionar as vendas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Impacto pendente:</span>
            <Badge variant="outline" className="bg-primary/10 text-primary font-semibold">
              {totalImpact} pts
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterMarketplace} onValueChange={(v) => setFilterMarketplace(v as any)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Marketplace" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos marketplaces</SelectItem>
            <SelectItem value="mercadolivre">Mercado Livre</SelectItem>
            <SelectItem value="shopee">Shopee</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="todo">A fazer</SelectItem>
            <SelectItem value="doing">Em andamento</SelectItem>
            <SelectItem value="done">Concluídas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban-style columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* To Do */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Circle className="h-4 w-4 text-muted-foreground" />
              A Fazer
              <Badge variant="secondary" className="ml-auto">
                {todoTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todoTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma tarefa pendente
              </p>
            ) : (
              todoTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Doing */}
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Em Andamento
              <Badge className="ml-auto">
                {doingTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {doingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma tarefa em andamento
              </p>
            ) : (
              doingTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Done */}
        <Card className="border-success/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Concluídas
              <Badge variant="outline" className="ml-auto status-success">
                {doneTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {doneTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma tarefa concluída hoje
              </p>
            ) : (
              doneTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-info/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Progresso de Hoje</p>
              <p className="text-sm text-muted-foreground">
                {doneTasks.length} de {warTasks.length} tarefas concluídas
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">
                {Math.round((doneTasks.length / warTasks.length) * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">Conclusão</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
