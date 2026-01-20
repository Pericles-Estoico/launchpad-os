import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus,
  CheckCircle2,
  AlertCircle,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';
import { MarketplaceBadge } from '@/components/common/MarketplaceBadge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { EmptyState } from '@/components/common/EmptyState';
import { MarketplaceKey } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ListingsPage() {
  const navigate = useNavigate();
  const { listingDrafts, products, selectedMarketplace, setSelectedMarketplace } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'draft'>('all');

  const filteredListings = listingDrafts.filter((listing) => {
    const matchesMarketplace = listing.marketplaceKey === selectedMarketplace;
    const product = products.find(p => p.id === listing.productId);
    const matchesSearch = product?.titleBase.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.copy.title_short.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'ready' && listing.readiness.ready) ||
      (statusFilter === 'draft' && !listing.readiness.ready);
    return matchesMarketplace && matchesSearch && matchesStatus;
  });

  const readyCount = listingDrafts.filter(l => l.marketplaceKey === selectedMarketplace && l.readiness.ready).length;
  const totalCount = listingDrafts.filter(l => l.marketplaceKey === selectedMarketplace).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Anúncios</h1>
          <p className="text-muted-foreground">
            Drafts de listagem por marketplace
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Draft
        </Button>
      </div>

      {/* Marketplace Tabs */}
      <Tabs 
        value={selectedMarketplace} 
        onValueChange={(v) => setSelectedMarketplace(v as MarketplaceKey)}
      >
        <TabsList>
          <TabsTrigger value="mercadolivre" className="gap-2">
            <MarketplaceBadge marketplace="mercadolivre" size="sm" />
          </TabsTrigger>
          <TabsTrigger value="shopee" className="gap-2">
            <MarketplaceBadge marketplace="shopee" size="sm" />
          </TabsTrigger>
        </TabsList>

        {/* Summary */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Prontos:</span>
            <span className="font-medium">{readyCount}/{totalCount}</span>
          </div>
          <ProgressBar value={(readyCount / totalCount) * 100} className="w-32" showLabel />
        </div>

        <TabsContent value={selectedMarketplace} className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por título..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ready">Prontos</SelectItem>
                <SelectItem value="draft">Com bloqueios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Listings Table */}
          {filteredListings.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-6 w-6" />}
              title="Nenhum anúncio encontrado"
              description="Crie drafts de anúncio a partir dos seus produtos"
              action={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Draft
                </Button>
              }
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Atualizado</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredListings.map((listing) => {
                      const product = products.find(p => p.id === listing.productId);
                      
                      return (
                        <TableRow 
                          key={listing.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/listings/${listing.id}`)}
                        >
                          <TableCell>
                            <div className="max-w-[300px]">
                              <p className="font-medium truncate">{listing.copy.title_short}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {listing.copy.keywords.slice(0, 3).join(', ')}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {product?.skuMaster}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ProgressBar 
                                value={listing.readiness.score} 
                                className="w-16"
                              />
                              <span className={cn(
                                'text-sm font-medium',
                                listing.readiness.score >= 80 ? 'text-success' : 
                                listing.readiness.score >= 50 ? 'text-warning' : 'text-destructive'
                              )}>
                                {listing.readiness.score}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {listing.readiness.ready ? (
                              <Badge variant="outline" className="status-success gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Pronto
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="status-warning gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {listing.readiness.blockers.length} bloqueio(s)
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(listing.updatedAt), { addSuffix: true, locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/listings/${listing.id}`); }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/listings/${listing.id}`); }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Blockers Summary */}
          {filteredListings.some(l => !l.readiness.ready) && (
            <Card className="border-warning/50 bg-warning/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  Bloqueios Comuns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(
                    filteredListings
                      .filter(l => !l.readiness.ready)
                      .flatMap(l => l.readiness.blockers)
                  )).map((blocker, i) => (
                    <Badge key={i} variant="outline" className="bg-card">
                      {blocker}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
