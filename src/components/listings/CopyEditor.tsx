import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CopyPayload } from '@/lib/types';

interface CopyEditorProps {
  copy: CopyPayload;
  onCopyChange: (copy: CopyPayload) => void;
  disabled?: boolean;
}

export function CopyEditor({ copy, onCopyChange, disabled }: CopyEditorProps) {
  const [newBullet, setNewBullet] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  const handleFieldChange = (field: keyof CopyPayload, value: any) => {
    onCopyChange({ ...copy, [field]: value });
  };

  const handleAidaChange = (field: keyof CopyPayload['aida'], value: string) => {
    onCopyChange({
      ...copy,
      aida: { ...copy.aida, [field]: value },
    });
  };

  const handleAddBullet = () => {
    if (!newBullet.trim()) return;
    onCopyChange({ ...copy, bullets: [...copy.bullets, newBullet.trim()] });
    setNewBullet('');
  };

  const handleRemoveBullet = (index: number) => {
    onCopyChange({ ...copy, bullets: copy.bullets.filter((_, i) => i !== index) });
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    if (copy.keywords.includes(newKeyword.trim().toLowerCase())) return;
    onCopyChange({ ...copy, keywords: [...copy.keywords, newKeyword.trim().toLowerCase()] });
    setNewKeyword('');
  };

  const handleRemoveKeyword = (index: number) => {
    onCopyChange({ ...copy, keywords: copy.keywords.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Titles */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Títulos</Label>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="title_short" className="text-sm">Título Curto</Label>
            <span className="text-xs text-muted-foreground">{copy.title_short.length}/60</span>
          </div>
          <Input
            id="title_short"
            value={copy.title_short}
            onChange={(e) => handleFieldChange('title_short', e.target.value.slice(0, 60))}
            maxLength={60}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="title_long" className="text-sm">Título Long-Tail</Label>
            <span className="text-xs text-muted-foreground">{copy.title_long_tail.length}/200</span>
          </div>
          <Textarea
            id="title_long"
            value={copy.title_long_tail}
            onChange={(e) => handleFieldChange('title_long_tail', e.target.value.slice(0, 200))}
            maxLength={200}
            rows={2}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Bullets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Bullet Points ({copy.bullets.length})</Label>
          {copy.bullets.length < 3 && (
            <Badge variant="outline" className="text-warning border-warning/30">
              Mínimo 3 recomendado
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          {copy.bullets.map((bullet, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-6">•</span>
              <Input
                value={bullet}
                onChange={(e) => {
                  const newBullets = [...copy.bullets];
                  newBullets[index] = e.target.value;
                  handleFieldChange('bullets', newBullets);
                }}
                disabled={disabled}
                className="flex-1"
              />
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemoveBullet(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {!disabled && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-6">+</span>
            <Input
              value={newBullet}
              onChange={(e) => setNewBullet(e.target.value)}
              placeholder="Novo bullet point..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddBullet()}
            />
            <Button variant="outline" size="sm" onClick={handleAddBullet}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* AIDA */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Label className="text-base font-medium">AIDA</Label>
          <Badge variant="outline">Framework de copywriting</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="aida_a" className="text-sm flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-xs font-bold">A</span>
              Atenção
            </Label>
            <Textarea
              id="aida_a"
              value={copy.aida.A}
              onChange={(e) => handleAidaChange('A', e.target.value)}
              rows={2}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aida_i" className="text-sm flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-xs font-bold">I</span>
              Interesse
            </Label>
            <Textarea
              id="aida_i"
              value={copy.aida.I}
              onChange={(e) => handleAidaChange('I', e.target.value)}
              rows={2}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aida_d" className="text-sm flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-xs font-bold">D</span>
              Desejo
            </Label>
            <Textarea
              id="aida_d"
              value={copy.aida.D}
              onChange={(e) => handleAidaChange('D', e.target.value)}
              rows={2}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aida_act" className="text-sm flex items-center gap-2">
              <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-xs font-bold">Act</span>
              Ação
            </Label>
            <Textarea
              id="aida_act"
              value={copy.aida.Act}
              onChange={(e) => handleAidaChange('Act', e.target.value)}
              rows={2}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Keywords ({copy.keywords.length})</Label>
          {copy.keywords.length < 5 && (
            <Badge variant="outline" className="text-warning border-warning/30">
              Mínimo 5 recomendado
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {copy.keywords.map((keyword, index) => (
            <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1">
              {keyword}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(index)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              )}
            </Badge>
          ))}
        </div>

        {!disabled && (
          <div className="flex items-center gap-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Nova keyword..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
            />
            <Button variant="outline" size="sm" onClick={handleAddKeyword}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
