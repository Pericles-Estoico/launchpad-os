import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className,
  variant = 'default',
  showLabel = false 
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-destructive',
  };

  // Auto-detect variant based on percentage
  const autoVariant = percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'error';
  const finalVariant = variant === 'default' ? autoVariant : variant;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="progress-bar flex-1">
        <div
          className={cn('progress-fill', variantClasses[finalVariant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground min-w-[3ch]">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
