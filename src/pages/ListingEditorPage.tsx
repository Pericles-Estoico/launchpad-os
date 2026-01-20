import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CopyEditor } from '@/components/listings/CopyEditor';
import { MediaSelector } from '@/components/listings/MediaSelector';
import { MarketplaceBadge } from '@/components/common/MarketplaceBadge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useAppStore, canAccess } from '@/store/useAppStore';
import { ListingDraft, CopyPayload } from '@/lib/types';
import { toast } from 'sonner';

export default function ListingEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    listingDrafts, 
    products, 
    mediaSets, 
    gateRuns,
    updateListingDraft, 
    currentUser 
  } = useAppStore();

  const draft = listingDrafts.find((d) => d.id === id);
  const product = draft ? products.find((p) => p.id === draft.productId) : null;
  const mediaSet = product?.mediaSetId ? mediaSets.find((ms) => ms.id === product.mediaSetId) : null;

  const [formData, setFormData] = useState<Partial<ListingDraft>>({});
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const canEdit = canAccess(currentUser, ['admin', 'catalogo']);

  // Check if publish gate is approved
  const publishGate = useMemo(() => {
    if (!draft) return null;
    return gateRuns.find(
      (g) => g.marketplaceKey === draft.marketplaceKey && g.gateKey === draft.publishGateKey
    );
  }, [draft, gateRuns]);

  const canPublish = publishGate?.status === 'approved';

  useEffect(() => {
    if (draft) {
      setFormData({ ...draft });
      // Initialize selected photos from listing_safe photos
      if (mediaSet) {
        const safePhotoIds = mediaSet.photos
          .filter((p) => p.track === 'listing_safe')
          .map((p) => p.id);
        setSelectedPhotoIds(safePhotoIds);
      }
    }
  }, [draft, mediaSet]);

  if (!draft || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Anúncio não encontrado</p>
        <Button variant="outline" onClick={() => navigate('/listings')}>
          Voltar para listings
        </Button>
      </div>
    );
  }

  const handleAttributeChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [key]: value },
    }));
    setHasChanges(true);
  };

  const handleCopyChange = (copy: CopyPayload) => {
    setFormData((prev) => ({ ...prev, copy }));
    setHasChanges(true);
  };

  const handlePhotoSelectionChange = (photoIds: string[]) => {
    setSelectedPhotoIds(photoIds);
    setHasChanges(true);
  };

  // Calculate readiness
  const calculateReadiness = () => {
    const blockers: string[] = [];
    let score = 100;

    if (!formData.copy?.title_short || formData.copy.title_short.length < 10) {
      blockers.push('Título curto muito pequeno');
      score -= 20;
    }

    if (!formData.copy?.bullets || formData.copy.bullets.length < 3) {
      blockers.push('Menos de 3 bullet points');
      score -= 15;
    }

    if (!formData.copy?.keywords || formData.copy.keywords.length < 5) {
      blockers.push('Menos de 5 keywords');
      score -= 10;
    }

    if (selectedPhotoIds.length === 0) {
      blockers.push('Nenhuma foto selecionada');
      score -= 25;
    }

    if (!publishGate || publishGate.status !== 'approved') {
      blockers.push('Gate de publicação não aprovado');
      score -= 30;
    }

    return {
      ready: blockers.length === 0 && score >= 80,
      score: Math.max(0, score),
      blockers,
    };
  };

  const readiness = calculateReadiness();

  const handleSave = () => {
    const newReadiness = calculateReadiness();
    
    updateListingDraft(draft.id, {
      ...formData,
      readiness: newReadiness,
      status: newReadiness.ready ? 'ready' : 'draft',
    });

    setHasChanges(false);
    toast.success('Anúncio salvo com sucesso');
  };

  const handleMarkPublished = () => {
    if (!canPublish) {
      toast.error('Gate de publicação não aprovado');
      return;
    }

    if (!readiness.ready) {
      toast.error('Anúncio não está pronto para publicação');
      return;
    }

    updateListingDraft(draft.id, {
      status: 'published',
    });

    toast.success('Anúncio marcado como publicado');
    navigate('/listings');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/listings')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{product.titleBase}</h1>
              <MarketplaceBadge marketplace={draft.marketplaceKey} size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">Editar anúncio</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="outline"
                      onClick={handleMarkPublished}
                      disabled={!canPublish || !readiness.ready}
                    >
                      {!canPublish && <Lock className="mr-2 h-4 w-4" />}
                      Marcar Publicado
                    </Button>
                  </span>
                </TooltipTrigger>
                {(!canPublish || !readiness.ready) && (
                  <TooltipContent>
                    {!canPublish
                      ? 'Gate de publicação precisa ser aprovado primeiro'
                      : 'Corrija os blockers antes de publicar'}
                  </TooltipContent>
                )}
              </Tooltip>
              <Button onClick={handleSave} disabled={!hasChanges}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Readiness Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Prontidão do Anúncio</span>
              <Badge variant={readiness.ready ? 'default' : 'secondary'}>
                {readiness.ready ? 'Pronto' : 'Pendente'}
              </Badge>
            </div>
            <span className="text-lg font-bold">{readiness.score}%</span>
          </div>
          <ProgressBar value={readiness.score} max={100} />
          
          {readiness.blockers.length > 0 && (
            <div className="mt-4 rounded-lg bg-destructive/5 border border-destructive/20 p-3">
              <p className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Blockers ({readiness.blockers.length})
              </p>
              <ul className="mt-2 space-y-1">
                {readiness.blockers.map((blocker, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {blocker}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="copy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="copy">Copy</TabsTrigger>
          <TabsTrigger value="attributes">Atributos</TabsTrigger>
          <TabsTrigger value="media">Mídia ({selectedPhotoIds.length})</TabsTrigger>
          <TabsTrigger value="preview">Prévia</TabsTrigger>
        </TabsList>

        {/* Copy Tab */}
        <TabsContent value="copy">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Textos do Anúncio</CardTitle>
              <CardDescription>
                Edite títulos, bullets e copy AIDA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CopyEditor
                copy={formData.copy || draft.copy}
                onCopyChange={handleCopyChange}
                disabled={!canEdit}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attributes Tab */}
        <TabsContent value="attributes">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Atributos do Marketplace</CardTitle>
              <CardDescription>
                Campos específicos do {draft.marketplaceKey === 'mercadolivre' ? 'Mercado Livre' : 'Shopee'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Condição</Label>
                  <Input
                    value={formData.attributes?.condition || 'new'}
                    onChange={(e) => handleAttributeChange('condition', e.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                
                {draft.marketplaceKey === 'mercadolivre' && (
                  <>
                    <div className="space-y-2">
                      <Label>Tipo de Listagem</Label>
                      <Input
                        value={formData.attributes?.listing_type || 'gold_special'}
                        onChange={(e) => handleAttributeChange('listing_type', e.target.value)}
                        disabled={!canEdit}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Garantia</Label>
                      <Input
                        value={formData.attributes?.warranty || ''}
                        onChange={(e) => handleAttributeChange('warranty', e.target.value)}
                        placeholder="30 dias contra defeitos"
                        disabled={!canEdit}
                      />
                    </div>
                  </>
                )}

                {draft.marketplaceKey === 'shopee' && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.attributes?.shop_voucher || false}
                        onChange={(e) => handleAttributeChange('shop_voucher', e.target.checked)}
                        disabled={!canEdit}
                        className="rounded"
                      />
                      Aceita Voucher da Loja
                    </Label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fotos do Anúncio</CardTitle>
              <CardDescription>
                Selecione as fotos para usar no anúncio (apenas LISTING_SAFE)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaSelector
                mediaSet={mediaSet}
                selectedPhotoIds={selectedPhotoIds}
                onSelectionChange={handlePhotoSelectionChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prévia do Anúncio</CardTitle>
              <CardDescription>
                Como o anúncio aparecerá no marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-6 space-y-4 bg-card">
                {/* Preview Header */}
                <div className="flex gap-4">
                  {mediaSet && selectedPhotoIds.length > 0 && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border">
                      <img
                        src={mediaSet.photos.find((p) => p.id === selectedPhotoIds[0])?.urlMock}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">
                      {formData.copy?.title_short || draft.copy.title_short}
                    </h3>
                    <p className="text-2xl font-bold text-primary">
                      R$ {product.priceBRL.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{product.brand}</Badge>
                      <Badge variant="secondary">{formData.attributes?.condition || 'Novo'}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Bullets */}
                <div>
                  <p className="text-sm font-medium mb-2">Características</p>
                  <ul className="space-y-1">
                    {(formData.copy?.bullets || draft.copy.bullets).map((bullet, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <p className="text-sm font-medium mb-2">Descrição</p>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p><strong>✨ {(formData.copy?.aida || draft.copy.aida).A}</strong></p>
                    <p>{(formData.copy?.aida || draft.copy.aida).I}</p>
                    <p>{(formData.copy?.aida || draft.copy.aida).D}</p>
                    <p className="font-medium text-primary">{(formData.copy?.aida || draft.copy.aida).Act}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
