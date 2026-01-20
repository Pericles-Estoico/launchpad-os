import { GateStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Lock, Clock, Send, CheckCircle2, XCircle } from 'lucide-react';

interface GateStatusBadgeProps {
  status: GateStatus;
  showLabel?: boolean;
}

const statusConfig: Record<GateStatus, { label: string; icon: React.ElementType; className: string }> = {
  locked: { label: 'Bloqueado', icon: Lock, className: 'gate-locked' },
  in_progress: { label: 'Em Progresso', icon: Clock, className: 'gate-in-progress' },
  submitted: { label: 'Aguardando', icon: Send, className: 'gate-submitted' },
  approved: { label: 'Aprovado', icon: CheckCircle2, className: 'gate-approved' },
  rejected: { label: 'Rejeitado', icon: XCircle, className: 'gate-rejected' },
};

export function GateStatusBadge({ status, showLabel = true }: GateStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        config.className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {showLabel && config.label}
    </span>
  );
}
