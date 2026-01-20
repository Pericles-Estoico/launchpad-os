import { useState } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MediaAsset, MediaSet } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MediaSelectorProps {
  mediaSet: MediaSet | null;
  selectedPhotoIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export function MediaSelector({ mediaSet, selectedPhotoIds, onSelectionChange }: MediaSelectorProps) {
  const listingSafePhotos = mediaSet?.photos.filter((p) => p.track === 'listing_safe') || [];
  const creativeOnlyPhotos = mediaSet?.photos.filter((p) => p.track === 'creative_only') || [];

  const togglePhoto = (photoId: string) => {
    if (selectedPhotoIds.includes(photoId)) {
      onSelectionChange(selectedPhotoIds.filter((id) => id !== photoId));
    } else {
      onSelectionChange([...selectedPhotoIds, photoId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Listing Safe Photos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            Fotos disponíveis para anúncio ({listingSafePhotos.length})
          </Label>
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            LISTING_SAFE
          </Badge>
        </div>

        {listingSafePhotos.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {listingSafePhotos.map((photo) => {
              const isSelected = selectedPhotoIds.includes(photo.id);
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => togglePhoto(photo.id)}
                  className={cn(
                    'relative aspect-square rounded-lg border-2 overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    isSelected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'
                  )}
                >
                  <img
                    src={photo.urlMock}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                    <p className="text-[10px] text-white truncate">{photo.role}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Nenhuma foto LISTING_SAFE disponível
          </div>
        )}
      </div>

      {/* Creative Only Photos (disabled/info) */}
      {creativeOnlyPhotos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Fotos criativas ({creativeOnlyPhotos.length})
              </Label>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              CREATIVE_ONLY
            </Badge>
          </div>

          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
            <p className="text-xs text-warning flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              Estas fotos não podem ser usadas em listings de marketplace. São apenas para anúncios e redes sociais.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 opacity-50">
            {creativeOnlyPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg border overflow-hidden cursor-not-allowed"
              >
                <img
                  src={photo.urlMock}
                  alt={photo.filename}
                  className="w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedPhotoIds.length > 0 && (
        <div className="rounded-lg bg-muted p-3">
          <p className="text-sm">
            <span className="font-medium">{selectedPhotoIds.length}</span> foto(s) selecionada(s) para o anúncio
          </p>
        </div>
      )}
    </div>
  );
}
