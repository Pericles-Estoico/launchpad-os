import { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Video, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MediaAsset, VideoAsset, MediaRole, MediaTrack, MediaSet } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MediaManagerProps {
  mediaSet: MediaSet | null;
  onMediaSetChange: (mediaSet: MediaSet) => void;
  productId: string;
}

const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400',
  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
];

export function MediaManager({ mediaSet, onMediaSetChange, productId }: MediaManagerProps) {
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [newPhoto, setNewPhoto] = useState<{
    role: MediaRole;
    track: MediaTrack;
    filename: string;
  }>({
    role: 'hero',
    track: 'listing_safe',
    filename: '',
  });

  const photos = mediaSet?.photos || [];
  const videos = mediaSet?.videos || [];

  const handleAddPhoto = () => {
    const randomImage = MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
    const newAsset: MediaAsset = {
      id: `photo-${Date.now()}`,
      role: newPhoto.role,
      track: newPhoto.track,
      urlMock: randomImage,
      filename: newPhoto.filename || `foto_${Date.now()}.jpg`,
    };

    const updatedMediaSet: MediaSet = mediaSet
      ? { ...mediaSet, photos: [...mediaSet.photos, newAsset] }
      : {
          id: `ms-${productId}`,
          productId,
          photos: [newAsset],
          videos: [],
          report: { score: 0, issues: [] },
        };

    onMediaSetChange(updatedMediaSet);
    setIsAddingPhoto(false);
    setNewPhoto({ role: 'hero', track: 'listing_safe', filename: '' });
    toast.success('Foto adicionada (mock)');
  };

  const handleDeletePhoto = (photoId: string) => {
    if (!mediaSet) return;
    const updatedPhotos = mediaSet.photos.filter((p) => p.id !== photoId);
    onMediaSetChange({ ...mediaSet, photos: updatedPhotos });
    toast.success('Foto removida');
  };

  const handleDeleteVideo = (videoId: string) => {
    if (!mediaSet) return;
    const updatedVideos = mediaSet.videos.filter((v) => v.id !== videoId);
    onMediaSetChange({ ...mediaSet, videos: updatedVideos });
    toast.success('Vídeo removido');
  };

  const getTrackBadge = (track: MediaTrack) => {
    if (track === 'listing_safe') {
      return <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">LISTING_SAFE</Badge>;
    }
    return <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">CREATIVE_ONLY</Badge>;
  };

  const getRoleBadge = (role: MediaRole) => {
    const colors: Record<MediaRole, string> = {
      hero: 'bg-primary/10 text-primary border-primary/30',
      detail: 'bg-info/10 text-info border-info/30',
      variant: 'bg-secondary text-secondary-foreground',
      lifestyle: 'bg-accent text-accent-foreground',
    };
    return <Badge variant="outline" className={cn('text-xs', colors[role])}>{role}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Photos Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Fotos ({photos.length})</Label>
          <Dialog open={isAddingPhoto} onOpenChange={setIsAddingPhoto}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload Foto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Foto</DialogTitle>
                <DialogDescription>
                  Configure a role e track da foto (upload simulado)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome do arquivo</Label>
                  <Input
                    value={newPhoto.filename}
                    onChange={(e) => setNewPhoto({ ...newPhoto, filename: e.target.value })}
                    placeholder="produto_hero.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={newPhoto.role}
                    onValueChange={(value: MediaRole) => setNewPhoto({ ...newPhoto, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero (principal)</SelectItem>
                      <SelectItem value="detail">Detail (detalhe)</SelectItem>
                      <SelectItem value="variant">Variant (variante)</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Track</Label>
                  <Select
                    value={newPhoto.track}
                    onValueChange={(value: MediaTrack) => setNewPhoto({ ...newPhoto, track: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="listing_safe">LISTING_SAFE (para anúncios)</SelectItem>
                      <SelectItem value="creative_only">CREATIVE_ONLY (só ads/social)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {newPhoto.track === 'listing_safe'
                      ? 'Pode ser usada em listings de marketplace'
                      : 'Apenas para anúncios e redes sociais'}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingPhoto(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddPhoto}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-lg border overflow-hidden bg-muted"
              >
                <img
                  src={photo.urlMock}
                  alt={photo.filename}
                  className="aspect-square object-cover w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {getRoleBadge(photo.role)}
                    {getTrackBadge(photo.track)}
                  </div>
                  <p className="text-xs text-white truncate">{photo.filename}</p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeletePhoto(photo.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
                {photo.enhanced && (
                  <Badge className="absolute top-2 left-2 text-xs">Enhanced</Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma foto adicionada</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddingPhoto(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar primeira foto
            </Button>
          </div>
        )}
      </div>

      {/* Videos Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Vídeos ({videos.length})</Label>
          <Button variant="outline" size="sm" disabled>
            <Upload className="mr-2 h-4 w-4" />
            Upload Vídeo
          </Button>
        </div>

        {videos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group relative rounded-lg border overflow-hidden bg-muted"
              >
                <div className="aspect-video flex items-center justify-center bg-muted">
                  <Video className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1 mb-1">
                    <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                      CREATIVE_ONLY
                    </Badge>
                    <Badge variant="outline" className="text-xs">{video.format}</Badge>
                  </div>
                  <p className="text-xs text-white truncate">{video.filename}</p>
                  {video.duration && (
                    <p className="text-xs text-white/70">{video.duration}s</p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteVideo(video.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Video className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum vídeo adicionado</p>
            <p className="text-xs text-muted-foreground mt-1">
              Vídeos podem ser gerados pelo AI Studio
            </p>
          </div>
        )}
      </div>

      {/* Media Report */}
      {mediaSet && (
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Score de Mídia</Label>
            <Badge variant={mediaSet.report.score >= 80 ? 'default' : 'secondary'}>
              {mediaSet.report.score}%
            </Badge>
          </div>
          {mediaSet.report.issues.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Problemas identificados:</p>
              <ul className="text-xs text-warning">
                {mediaSet.report.issues.map((issue, i) => (
                  <li key={i}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
