import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Package, 
  Edit, 
  Trash2,
  Image as ImageIcon,
  Copy,
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppStore, canAccess } from '@/store/useAppStore';
import { Product, ProductRecipe } from '@/lib/types';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { products, mediaSets, currentUser, addProduct, deleteProduct } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRecipe, setFilterRecipe] = useState<ProductRecipe | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    skuMaster: '',
    titleBase: '',
    brand: 'ModaFlex',
    recipe: 'apparel' as ProductRecipe,
  });

  const hasAccess = canAccess(currentUser, ['admin', 'catalogo']);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.titleBase.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.skuMaster.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRecipe = filterRecipe === 'all' || product.recipe === filterRecipe;
    return matchesSearch && matchesRecipe;
  });

  const getMediaSet = (mediaSetId?: string) => {
    return mediaSets.find(ms => ms.id === mediaSetId);
  };

  const handleAddProduct = () => {
    if (!newProduct.skuMaster || !newProduct.titleBase) {
      toast.error('Preencha SKU e Nome do produto');
      return;
    }

    const product: Product = {
      id: `prod-${Date.now()}`,
      skuMaster: newProduct.skuMaster,
      titleBase: newProduct.titleBase,
      brand: newProduct.brand,
      recipe: newProduct.recipe,
      materials: [],
      variants: [],
      dims: { weight_g: 0, length_cm: 0, width_cm: 0, height_cm: 0 },
      priceBRL: 0,
      costBRL: 0,
      inventory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addProduct(product);
    setIsAddDialogOpen(false);
    setNewProduct({ skuMaster: '', titleBase: '', brand: 'ModaFlex', recipe: 'apparel' });
    toast.success('Produto adicionado com sucesso!');
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    toast.success('Produto removido');
  };

  const totalInventory = (product: Product) => {
    return product.inventory.reduce((sum, inv) => sum + inv.qty, 0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produtos (PIM)</h1>
          <p className="text-muted-foreground">
            {products.length} produtos cadastrados
          </p>
        </div>
        {hasAccess ? (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Produto</DialogTitle>
                <DialogDescription>
                  Preencha as informações básicas do produto
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU Master</Label>
                  <Input 
                    id="sku" 
                    placeholder="MF-PRODUTO-001"
                    value={newProduct.skuMaster}
                    onChange={(e) => setNewProduct({ ...newProduct, skuMaster: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Nome do Produto</Label>
                  <Input 
                    id="title" 
                    placeholder="Camiseta Básica..."
                    value={newProduct.titleBase}
                    onChange={(e) => setNewProduct({ ...newProduct, titleBase: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input 
                    id="brand" 
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Produto</Label>
                  <Select 
                    value={newProduct.recipe} 
                    onValueChange={(v) => setNewProduct({ ...newProduct, recipe: v as ProductRecipe })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apparel">Vestuário</SelectItem>
                      <SelectItem value="kit">Kit</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddProduct}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button disabled>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Você não tem permissão para adicionar produtos. Fale com um administrador.
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou SKU..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterRecipe} onValueChange={(v) => setFilterRecipe(v as ProductRecipe | 'all')}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="apparel">Vestuário</SelectItem>
            <SelectItem value="kit">Kit</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="Nenhum produto encontrado"
          description={searchQuery ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro produto'}
          action={
            hasAccess && !searchQuery && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Produto
              </Button>
            )
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]"></TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Variantes</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Mídia</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const mediaSet = getMediaSet(product.mediaSetId);
                  const heroImage = mediaSet?.photos.find(p => p.role === 'hero');
                  
                  return (
                    <TableRow 
                      key={product.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <TableCell>
                        <div className="h-10 w-10 rounded-lg border bg-muted overflow-hidden">
                          {heroImage ? (
                            <img 
                              src={heroImage.urlMock} 
                              alt={product.titleBase}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.titleBase}</p>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {product.skuMaster}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {product.recipe === 'apparel' ? 'Vestuário' : product.recipe === 'kit' ? 'Kit' : 'Personalizado'}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.variants.length}</TableCell>
                      <TableCell>
                        <span className={cn(
                          totalInventory(product) === 0 && 'text-destructive'
                        )}>
                          {totalInventory(product)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {product.priceBRL.toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </TableCell>
                      <TableCell>
                        {mediaSet ? (
                          <div className="flex items-center gap-1">
                            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{mediaSet.photos.length}</span>
                            {mediaSet.report.score >= 80 ? (
                              <Badge variant="outline" className="status-success text-xs ml-1">
                                {mediaSet.report.score}%
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="status-warning text-xs ml-1">
                                {mediaSet.report.score}%
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sem mídia</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`); }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                            >
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
    </div>
  );
}
