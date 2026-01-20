import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductVariant, InventoryItem } from '@/lib/types';

interface VariantsEditorProps {
  variants: ProductVariant[];
  inventory: InventoryItem[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  onInventoryChange: (inventory: InventoryItem[]) => void;
}

export function VariantsEditor({
  variants,
  inventory,
  onVariantsChange,
  onInventoryChange,
}: VariantsEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ProductVariant & { qty: number }>({
    size: '',
    color: '',
    skuVariant: '',
    qty: 0,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newVariant, setNewVariant] = useState<ProductVariant & { qty: number }>({
    size: '',
    color: '',
    skuVariant: '',
    qty: 0,
  });

  const getInventoryQty = (skuVariant: string) => {
    return inventory.find((i) => i.skuVariant === skuVariant)?.qty || 0;
  };

  const handleStartEdit = (index: number) => {
    const variant = variants[index];
    setEditingIndex(index);
    setEditForm({
      ...variant,
      qty: getInventoryQty(variant.skuVariant),
    });
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const oldSku = variants[editingIndex].skuVariant;
    const updatedVariants = [...variants];
    updatedVariants[editingIndex] = {
      size: editForm.size,
      color: editForm.color,
      skuVariant: editForm.skuVariant,
    };
    onVariantsChange(updatedVariants);

    // Update inventory
    const updatedInventory = inventory.filter((i) => i.skuVariant !== oldSku);
    updatedInventory.push({ skuVariant: editForm.skuVariant, qty: editForm.qty });
    onInventoryChange(updatedInventory);

    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const skuToDelete = variants[index].skuVariant;
    const updatedVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(updatedVariants);

    const updatedInventory = inventory.filter((i) => i.skuVariant !== skuToDelete);
    onInventoryChange(updatedInventory);
  };

  const handleAddVariant = () => {
    if (!newVariant.skuVariant || !newVariant.size || !newVariant.color) return;

    onVariantsChange([...variants, {
      size: newVariant.size,
      color: newVariant.color,
      skuVariant: newVariant.skuVariant,
    }]);

    onInventoryChange([...inventory, {
      skuVariant: newVariant.skuVariant,
      qty: newVariant.qty,
    }]);

    setNewVariant({ size: '', color: '', skuVariant: '', qty: 0 });
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Variantes ({variants.length})</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Variante
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU Variante</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead className="text-right">Estoque</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAdding && (
              <TableRow>
                <TableCell>
                  <Input
                    value={newVariant.skuVariant}
                    onChange={(e) => setNewVariant({ ...newVariant, skuVariant: e.target.value })}
                    placeholder="SKU-001"
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newVariant.size}
                    onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                    placeholder="M"
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={newVariant.color}
                    onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                    placeholder="Preto"
                    className="h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newVariant.qty}
                    onChange={(e) => setNewVariant({ ...newVariant, qty: parseInt(e.target.value) || 0 })}
                    className="h-8 w-20 text-right"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleAddVariant}
                    >
                      <Check className="h-4 w-4 text-success" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsAdding(false)}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {variants.map((variant, index) => (
              <TableRow key={variant.skuVariant}>
                {editingIndex === index ? (
                  <>
                    <TableCell>
                      <Input
                        value={editForm.skuVariant}
                        onChange={(e) => setEditForm({ ...editForm, skuVariant: e.target.value })}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editForm.size}
                        onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editForm.color}
                        onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editForm.qty}
                        onChange={(e) => setEditForm({ ...editForm, qty: parseInt(e.target.value) || 0 })}
                        className="h-8 w-20 text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleSaveEdit}
                        >
                          <Check className="h-4 w-4 text-success" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-mono text-sm">{variant.skuVariant}</TableCell>
                    <TableCell>{variant.size}</TableCell>
                    <TableCell>{variant.color}</TableCell>
                    <TableCell className="text-right">{getInventoryQty(variant.skuVariant)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleStartEdit(index)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {variants.length === 0 && !isAdding && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma variante cadastrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
