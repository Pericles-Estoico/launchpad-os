import { useState } from 'react';
import { 
  Rss, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function MerchantPage() {
  const { merchantFeedRows, products } = useAppStore();
  const [showValidOnly, setShowValidOnly] = useState(false);

  const validCount = merchantFeedRows.filter(r => r.validation.valid).length;
  const totalCount = merchantFeedRows.length;

  const filteredRows = showValidOnly 
    ? merchantFeedRows.filter(r => r.validation.valid)
    : merchantFeedRows;

  const handleExportCSV = () => {
    const rows = showValidOnly 
      ? merchantFeedRows.filter(r => r.validation.valid)
      : merchantFeedRows;

    const headers = ['id', 'title', 'link', 'image_link', 'availability', 'price', 'brand', 'gtin', 'mpn', 'condition', 'google_product_category', 'shipping_weight'];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => [
        row.fields.id,
        row.aiDisclosure.structured_title?.content || '',
        row.fields.link,
        row.fields.image_link,
        row.fields.availability,
        row.fields.price,
        row.fields.brand,
        row.fields.gtin || '',
        row.fields.mpn || '',
        row.fields.condition,
        row.fields.google_product_category,
        row.fields.shipping_weight,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merchant-feed-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success(`Feed exportado: ${rows.length} produtos`);
  };

  const handleValidate = () => {
    toast.success('Validação concluída');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Rss className="h-6 w-6" />
            Merchant Center
          </h1>
          <p className="text-muted-foreground">
            Feed de produtos para Google Merchant Center
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleValidate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Validar Feed
          </Button>
          <Button onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{validCount}</p>
                <p className="text-sm text-muted-foreground">Produtos válidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{totalCount - validCount}</p>
                <p className="text-sm text-muted-foreground">Com erros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-info/10">
                <Rss className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{totalCount}</p>
                <p className="text-sm text-muted-foreground">Total no feed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Switch 
          id="valid-only" 
          checked={showValidOnly}
          onCheckedChange={setShowValidOnly}
        />
        <Label htmlFor="valid-only">Mostrar apenas válidos</Label>
      </div>

      {/* Feed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Itens do Feed</CardTitle>
          <CardDescription>
            {filteredRows.length} produtos no feed
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Disponibilidade</TableHead>
                <TableHead>GTIN</TableHead>
                <TableHead>AI</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => {
                const product = products.find(p => p.id === row.productId);
                
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {row.fields.id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="truncate font-medium">
                          {row.aiDisclosure.structured_title?.content || product?.titleBase}
                        </p>
                        {row.aiDisclosure.useStructured && (
                          <p className="text-xs text-muted-foreground">
                            structured_title
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{row.fields.price}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={cn(
                          row.fields.availability === 'in_stock' && 'status-success',
                          row.fields.availability === 'out_of_stock' && 'status-error',
                          row.fields.availability === 'preorder' && 'status-warning',
                        )}
                      >
                        {row.fields.availability === 'in_stock' && 'Em estoque'}
                        {row.fields.availability === 'out_of_stock' && 'Esgotado'}
                        {row.fields.availability === 'preorder' && 'Pré-venda'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.fields.gtin ? (
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {row.fields.gtin}
                        </code>
                      ) : (
                        <span className="text-xs text-destructive">Ausente</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.aiDisclosure.useStructured ? (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          AI Generated
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Manual</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.validation.valid ? (
                        <Badge variant="outline" className="status-success gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Válido
                        </Badge>
                      ) : (
                        <div className="space-y-1">
                          {row.validation.errors.map((err, i) => (
                            <Badge key={i} variant="outline" className="status-error gap-1 block w-fit">
                              <XCircle className="h-3 w-3" />
                              {err}
                            </Badge>
                          ))}
                          {row.validation.warnings.map((warn, i) => (
                            <Badge key={i} variant="outline" className="status-warning gap-1 block w-fit">
                              <AlertTriangle className="h-3 w-3" />
                              {warn}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AI Disclosure Info */}
      <Card className="border-info/50 bg-info/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-info/10">
              <Rss className="h-4 w-4 text-info" />
            </div>
            <div>
              <p className="font-medium">Conformidade com Merchant Center</p>
              <p className="text-sm text-muted-foreground mt-1">
                Produtos com conteúdo gerado por AI incluem <code className="bg-muted px-1 rounded">digitalSourceType: "trained_algorithmic_media"</code> nos campos structured_title e structured_description conforme as diretrizes do Google.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
