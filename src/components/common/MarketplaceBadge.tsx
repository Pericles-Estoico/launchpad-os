import { MarketplaceKey, MARKETPLACE_CONFIG } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface MarketplaceBadgeProps {
  marketplace: MarketplaceKey;
  size?: 'sm' | 'md';
  showWave?: boolean;
}

export function MarketplaceBadge({ marketplace, size = 'md', showWave = false }: MarketplaceBadgeProps) {
  const config = MARKETPLACE_CONFIG[marketplace];
  
  const colorClasses: Record<string, string> = {
    ml: 'bg-amber-100 text-amber-700 border-amber-200',
    shopee: 'bg-orange-100 text-orange-700 border-orange-200',
    shein: 'bg-gray-100 text-gray-700 border-gray-200',
    tiktok: 'bg-pink-100 text-pink-700 border-pink-200',
    kwai: 'bg-red-100 text-red-700 border-red-200',
    amazon: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border',
        colorClasses[config.color],
        size === 'sm' ? 'text-xs px-1.5 py-0' : 'text-xs'
      )}
    >
      {config.shortName}
      {showWave && (
        <span className="ml-1 opacity-60">
          ({config.wave === 'wave1' ? 'W1' : 'W2'})
        </span>
      )}
    </Badge>
  );
}
