import { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Image as ImageIcon,
  Eye,
  Wand2,
  FileText,
  Shield,
  Video,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/useAppStore';
import { AIStage, Product, AIRun } from '@/lib/types';
import { 
  runVision, 
  fillRequiredAttrs, 
  generateCopy, 
  formatMerchant, 
  guard, 
  enhanceImages,
  generateCreatives,
  generateVideos,
  createAIRun,
} from '@/lib/mock-ai';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PIPELINE_STAGES: { key: AIStage; label: string; icon: React.ElementType; description: string }[] = [
  { key: 'vision', label: 'Análise Visual', icon: Eye, description: 'Analisa fotos do produto' },
  { key: 'attrs', label: 'Atributos', icon: FileText, description: 'Preenche campos obrigatórios' },
  { key: 'copy', label: 'Copy (AIDA)', icon: Wand2, description: 'Gera títulos e descrições' },
  { key: 'merchant', label: 'Merchant', icon: FileText, description: 'Formata para Merchant Center' },
  { key: 'guard', label: 'Guard', icon: Shield, description: 'Valida compliance' },
  { key: 'img_enhance', label: 'Otimizar Fotos', icon: ImageIcon, description: 'Melhora fotos para listing' },
];

const CREATIVE_STAGES: { key: AIStage; label: string; icon: React.ElementType }[] = [
  { key: 'img_generate', label: 'Gerar Criativos', icon: ImageIcon },
  { key: 'video_generate', label: 'Gerar Vídeos', icon: Video },
];

export default function AIStudioPage() {
  const { products, mediaSets, addAIRun, aiRuns } = useAppStore();
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [generateCreativesEnabled, setGenerateCreativesEnabled] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<AIStage | null>(null);
  const [completedStages, setCompletedStages] = useState<Set<AIStage>>(new Set());
  const [stageResults, setStageResults] = useState<Record<string, any>>({});

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const productMediaSet = selectedProduct?.mediaSetId 
    ? mediaSets.find(ms => ms.id === selectedProduct.mediaSetId)
    : null;

  const runPipeline = async () => {
    if (!selectedProduct) {
      toast.error('Selecione um produto primeiro');
      return;
    }

    setIsRunning(true);
    setCompletedStages(new Set());
    setStageResults({});

    const stages = [...PIPELINE_STAGES.map(s => s.key)];
    if (generateCreativesEnabled) {
      stages.push(...CREATIVE_STAGES.map(s => s.key));
    }

    for (const stage of stages) {
      setCurrentStage(stage);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

      let result: any = null;

      switch (stage) {
        case 'vision':
          result = runVision(selectedProduct, productMediaSet?.photos || []);
          break;
        case 'attrs':
          result = fillRequiredAttrs(selectedProduct, 'mercadolivre');
          break;
        case 'copy':
          result = generateCopy(selectedProduct, 'mercadolivre', 'AIDA');
          break;
        case 'merchant':
          const copy = stageResults.copy || generateCopy(selectedProduct, 'mercadolivre', 'AIDA');
          result = formatMerchant(selectedProduct, copy);
          break;
        case 'guard':
          const copyForGuard = stageResults.copy || generateCopy(selectedProduct, 'mercadolivre', 'AIDA');
          const attrs = stageResults.attrs?.filledAttributes || {};
          result = guard(copyForGuard, attrs, selectedProduct);
          break;
        case 'img_enhance':
          result = enhanceImages(productMediaSet?.photos || []);
          break;
        case 'img_generate':
          result = generateCreatives(productMediaSet?.photos || []);
          break;
        case 'video_generate':
          result = generateVideos(productMediaSet?.photos || []);
          break;
      }

      setStageResults(prev => ({ ...prev, [stage]: result }));
      setCompletedStages(prev => new Set([...prev, stage]));

      // Log AI run
      const run = createAIRun(selectedProduct.id, stage, 'ok');
      addAIRun(run);
    }

    setCurrentStage(null);
    setIsRunning(false);
    toast.success('Pipeline concluído com sucesso!');
  };

  const allStages = generateCreativesEnabled 
    ? [...PIPELINE_STAGES, ...CREATIVE_STAGES]
    : PIPELINE_STAGES;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Studio
        </h1>
        <p className="text-muted-foreground">
          Pipeline de inteligência artificial para produtos
        </p>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuração do Pipeline</CardTitle>
          <CardDescription>
            Selecione um produto e configure as opções de processamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.titleBase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProduct && productMediaSet && (
              <div className="space-y-2">
                <Label>Fotos Disponíveis</Label>
                <div className="flex gap-2">
                  {productMediaSet.photos.slice(0, 4).map((photo) => (
                    <div 
                      key={photo.id}
                      className="h-12 w-12 rounded-lg border overflow-hidden"
                    >
                      <img 
                        src={photo.urlMock} 
                        alt="" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                  {productMediaSet.photos.length > 4 && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted text-sm font-medium">
                      +{productMediaSet.photos.length - 4}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Gerar Criativos</Label>
              <p className="text-sm text-muted-foreground">
                Cria fotos lifestyle e vídeos (CREATIVE_ONLY - não para listings)
              </p>
            </div>
            <Switch 
              checked={generateCreativesEnabled}
              onCheckedChange={setGenerateCreativesEnabled}
            />
          </div>

          <Button 
            onClick={runPipeline} 
            disabled={!selectedProductId || isRunning}
            className="w-full sm:w-auto"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Executar Pipeline
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pipeline Stages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Etapas do Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allStages.map((stage, index) => {
              const isCompleted = completedStages.has(stage.key);
              const isCurrent = currentStage === stage.key;
              const isPending = !isCompleted && !isCurrent;
              const Icon = stage.icon;
              const isCreativeStage = CREATIVE_STAGES.some(s => s.key === stage.key);

              return (
                <div 
                  key={stage.key}
                  className={cn(
                    'flex items-center gap-4 rounded-lg border p-4 transition-all',
                    isCurrent && 'ring-2 ring-primary/20 border-primary bg-primary/5',
                    isCompleted && 'border-success/30 bg-success/5',
                    isPending && 'opacity-50'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    isCompleted && 'bg-success text-success-foreground',
                    isCurrent && 'bg-primary text-primary-foreground',
                    isPending && 'bg-muted text-muted-foreground'
                  )}>
                    {isCurrent ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{stage.label}</p>
                      {isCreativeStage && (
                        <Badge variant="outline" className="text-xs">
                          Creative Only
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{stage.description}</p>
                  </div>

                  {isCompleted && stageResults[stage.key] && (
                    <Button variant="ghost" size="sm">
                      Ver resultado
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Results Preview */}
      {Object.keys(stageResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prévia dos Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Copy Preview */}
              {stageResults.copy && (
                <div className="space-y-2 rounded-lg border p-4">
                  <p className="text-sm font-medium">Título Gerado</p>
                  <p className="text-sm">{stageResults.copy.title_short}</p>
                  <p className="text-sm font-medium mt-3">Bullets</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {stageResults.copy.bullets.map((bullet: string, i: number) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Guard Result */}
              {stageResults.guard && (
                <div className="space-y-2 rounded-lg border p-4">
                  <p className="text-sm font-medium">Validação Guard</p>
                  <div className="flex items-center gap-2">
                    {stageResults.guard.passed ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm text-success">Aprovado</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-destructive" />
                        <span className="text-sm text-destructive">Bloqueios encontrados</span>
                      </>
                    )}
                  </div>
                  {stageResults.guard.riskFlags.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-warning">Alertas:</p>
                      <ul className="text-xs text-muted-foreground">
                        {stageResults.guard.riskFlags.map((flag: string, i: number) => (
                          <li key={i}>• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Vision Result */}
              {stageResults.vision && (
                <div className="space-y-2 rounded-lg border p-4">
                  <p className="text-sm font-medium">Análise Visual</p>
                  <p className="text-sm text-muted-foreground">
                    Confiança: {Math.round(stageResults.vision.confidence * 100)}%
                  </p>
                  {stageResults.vision.missingFields.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-warning">Campos faltando:</p>
                      <ul className="text-xs text-muted-foreground">
                        {stageResults.vision.missingFields.map((field: string, i: number) => (
                          <li key={i}>• {field}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Images */}
              {stageResults.img_enhance && (
                <div className="space-y-2 rounded-lg border p-4">
                  <p className="text-sm font-medium">Fotos Otimizadas</p>
                  <Badge variant="outline" className="status-success">LISTING_SAFE</Badge>
                  <ul className="text-xs text-muted-foreground mt-2">
                    {stageResults.img_enhance.improvements.map((imp: string, i: number) => (
                      <li key={i}>✓ {imp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Button>
                Aplicar ao Produto
              </Button>
              <Button variant="outline">
                Criar Draft de Anúncio
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
