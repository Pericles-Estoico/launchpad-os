import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Package, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { VariantsEditor } from '@/components/products/VariantsEditor';
import { MediaManager } from '@/components/products/MediaManager';
import { useAppStore, canAccess } from '@/store/useAppStore';
import { Product, ProductRecipe, MediaSet } from '@/lib/types';
import { toast } from 'sonner';

const RECIPE_REQUIRED_FIELDS: Record<ProductRecipe, string[]> = {
  apparel: ['materials', 'category', 'description'],
  kit: ['materials', 'category'],
  custom: ['category'],
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, mediaSets, updateProduct, deleteProduct, updateMediaSet, addMediaSet, currentUser } = useAppStore();

  const product = products.find((p) => p.id === id);
  const mediaSet = product?.mediaSetId ? mediaSets.find((ms) => ms.id === product.mediaSetId) : null;

  const [formData, setFormData] = useState<Partial<Product>>({});
  const [currentMediaSet, setCurrentMediaSet] = useState<MediaSet | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const canEdit = canAccess(currentUser, ['admin', 'catalogo']);

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
      setCurrentMediaSet(mediaSet);
    }
  }, [product, mediaSet]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Package className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Produto não encontrado</p>
        <Button variant="outline" onClick={() => navigate('/products')}>
          Voltar para produtos
        </Button>
      </div>
    );
  }

  const handleFieldChange = (field: keyof Product, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleVariantsChange = (variants: Product['variants']) => {
    setFormData((prev) => ({ ...prev, variants }));
    setHasChanges(true);
  };

  const handleInventoryChange = (inventory: Product['inventory']) => {
    setFormData((prev) => ({ ...prev, inventory }));
    setHasChanges(true);
  };

  const handleMediaSetChange = (newMediaSet: MediaSet) => {
    setCurrentMediaSet(newMediaSet);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!formData.titleBase?.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    // Validate recipe-based required fields
    const recipe = formData.recipe || 'custom';
    const requiredFields = RECIPE_REQUIRED_FIELDS[recipe];
    const missingFields = requiredFields.filter((field) => {
      const value = formData[field as keyof Product];
      if (Array.isArray(value)) return value.length === 0;
      return !value;
    });

    if (missingFields.length > 0) {
      toast.warning(`Campos recomendados para ${recipe}: ${missingFields.join(', ')}`);
    }

    // Update product
    updateProduct(product.id, formData);

    // Update or create media set
    if (currentMediaSet) {
      if (mediaSet) {
        updateMediaSet(currentMediaSet.id, currentMediaSet);
      } else {
        addMediaSet(currentMediaSet);
        updateProduct(product.id, { mediaSetId: currentMediaSet.id });
      }
    }

    setHasChanges(false);
    toast.success('Produto salvo com sucesso');
  };

  const handleDelete = () => {
    deleteProduct(product.id);
    toast.success('Produto excluído');
    navigate('/products');
  };

  const totalInventory = formData.inventory?.reduce((acc, item) => acc + item.qty, 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{product.titleBase}</h1>
            <p className="text-sm text-muted-foreground font-mono">{product.skuMaster}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O produto e seus dados serão removidos permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button onClick={handleSave} disabled={!hasChanges}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="variants">Variantes ({formData.variants?.length || 0})</TabsTrigger>
          <TabsTrigger value="media">Mídia</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações Básicas</CardTitle>
              <CardDescription>Dados principais do produto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="skuMaster">SKU Master</Label>
                  <Input
                    id="skuMaster"
                    value={formData.skuMaster || ''}
                    onChange={(e) => handleFieldChange('skuMaster', e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipe">Tipo (Recipe)</Label>
                  <Select
                    value={formData.recipe || 'apparel'}
                    onValueChange={(value: ProductRecipe) => handleFieldChange('recipe', value)}
                    disabled={!canEdit}
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

              <div className="space-y-2">
                <Label htmlFor="titleBase">Título Base</Label>
                <Input
                  id="titleBase"
                  value={formData.titleBase || ''}
                  onChange={(e) => handleFieldChange('titleBase', e.target.value)}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  rows={3}
                  disabled={!canEdit}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={formData.brand || ''}
                    onChange={(e) => handleFieldChange('brand', e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={formData.category || ''}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    placeholder="Vestuário > Camisetas"
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="materials">Materiais (separados por vírgula)</Label>
                <Input
                  id="materials"
                  value={formData.materials?.join(', ') || ''}
                  onChange={(e) => handleFieldChange('materials', e.target.value.split(',').map((m) => m.trim()).filter(Boolean))}
                  placeholder="100% Algodão, Elastano"
                  disabled={!canEdit}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preço e Dimensões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="priceBRL">Preço (R$)</Label>
                  <Input
                    id="priceBRL"
                    type="number"
                    step="0.01"
                    value={formData.priceBRL || 0}
                    onChange={(e) => handleFieldChange('priceBRL', parseFloat(e.target.value) || 0)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costBRL">Custo (R$)</Label>
                  <Input
                    id="costBRL"
                    type="number"
                    step="0.01"
                    value={formData.costBRL || 0}
                    onChange={(e) => handleFieldChange('costBRL', parseFloat(e.target.value) || 0)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Margem</Label>
                  <Input
                    value={`${(((formData.priceBRL || 0) - (formData.costBRL || 0)) / (formData.priceBRL || 1) * 100).toFixed(1)}%`}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estoque Total</Label>
                  <Input value={totalInventory} disabled className="bg-muted" />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (g)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.dims?.weight_g || 0}
                    onChange={(e) => handleFieldChange('dims', { ...formData.dims, weight_g: parseInt(e.target.value) || 0 })}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length">Comp. (cm)</Label>
                  <Input
                    id="length"
                    type="number"
                    value={formData.dims?.length_cm || 0}
                    onChange={(e) => handleFieldChange('dims', { ...formData.dims, length_cm: parseInt(e.target.value) || 0 })}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Larg. (cm)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={formData.dims?.width_cm || 0}
                    onChange={(e) => handleFieldChange('dims', { ...formData.dims, width_cm: parseInt(e.target.value) || 0 })}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Alt. (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.dims?.height_cm || 0}
                    onChange={(e) => handleFieldChange('dims', { ...formData.dims, height_cm: parseInt(e.target.value) || 0 })}
                    disabled={!canEdit}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Variantes do Produto</CardTitle>
              <CardDescription>
                Gerencie tamanhos, cores e estoque de cada variante
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canEdit ? (
                <VariantsEditor
                  variants={formData.variants || []}
                  inventory={formData.inventory || []}
                  onVariantsChange={handleVariantsChange}
                  onInventoryChange={handleInventoryChange}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Você não tem permissão para editar variantes
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mídia do Produto</CardTitle>
              <CardDescription>
                Fotos e vídeos associados ao produto
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canEdit ? (
                <MediaManager
                  mediaSet={currentMediaSet}
                  onMediaSetChange={handleMediaSetChange}
                  productId={product.id}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Você não tem permissão para gerenciar mídia
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
