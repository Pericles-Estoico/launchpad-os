import { Product, MediaAsset, VideoAsset, CopyPayload, MarketplaceKey, AIRun } from './types';

// Deterministic mock AI functions for demo purposes

export interface VisionResult {
  detectedAttributes: Record<string, any>;
  confidence: number;
  missingFields: string[];
}

export function runVision(product: Product, photos: MediaAsset[]): VisionResult {
  const detectedAttributes: Record<string, any> = {
    category: product.category || 'Vestuário',
    color_primary: product.variants[0]?.color || 'Não detectado',
    pattern: 'Sólido',
    style: product.recipe === 'apparel' ? 'Casual' : 'Kit',
    material_visual: product.materials[0] || 'Não detectado',
  };

  const missingFields: string[] = [];
  if (photos.length < 3) missingFields.push('Recomendado mínimo 3 fotos');
  if (!photos.find(p => p.role === 'detail')) missingFields.push('Falta foto de detalhe');
  if (!product.description) missingFields.push('Descrição do produto vazia');

  return {
    detectedAttributes,
    confidence: photos.length >= 3 ? 0.92 : 0.75,
    missingFields,
  };
}

export interface AttributesResult {
  filledAttributes: Record<string, any>;
  gaps: string[];
}

export function fillRequiredAttrs(product: Product, marketplaceKey: MarketplaceKey): AttributesResult {
  const baseAttrs: Record<string, any> = {
    condition: 'new',
    brand: product.brand,
    material: product.materials.join(', '),
    weight_kg: (product.dims.weight_g / 1000).toFixed(2),
  };

  const mlAttrs = {
    ...baseAttrs,
    listing_type: 'gold_special',
    warranty: '30 dias contra defeitos',
    sku: product.skuMaster,
  };

  const shopeeAttrs = {
    ...baseAttrs,
    shop_voucher_applicable: true,
    pre_order: false,
  };

  const gaps: string[] = [];
  if (!product.category) gaps.push('Categoria não definida');
  if (product.variants.length === 0) gaps.push('Sem variantes cadastradas');

  return {
    filledAttributes: marketplaceKey === 'mercadolivre' ? mlAttrs : shopeeAttrs,
    gaps,
  };
}

export type CopyMode = 'AIDA' | 'IADA';

export function generateCopy(product: Product, marketplaceKey: MarketplaceKey, mode: CopyMode = 'AIDA'): CopyPayload {
  const brandName = product.brand;
  const productType = product.titleBase.split(' ')[0];
  const material = product.materials[0] || 'tecido premium';
  
  const titleShort = `${product.titleBase} ${brandName}`;
  const titleLongTail = `${product.titleBase} ${brandName} ${product.variants[0]?.color || ''} ${product.materials.join(' ')}`.trim();

  const bullets = [
    `${material} de alta qualidade`,
    `Marca ${brandName} - garantia de procedência`,
    `Disponível em ${product.variants.length} variações`,
    `Dimensões: ${product.dims.length_cm}x${product.dims.width_cm}x${product.dims.height_cm}cm`,
  ];

  const aida = mode === 'AIDA' 
    ? {
        A: `Descubra o ${productType} perfeito para você!`,
        I: `${product.titleBase} confeccionado em ${material} com acabamento premium.`,
        D: `Conforto e estilo que você merece. ${product.variants.length} opções para combinar com seu estilo.`,
        Act: marketplaceKey === 'mercadolivre' 
          ? 'Compre agora e receba com frete grátis!' 
          : 'Adicione ao carrinho e aproveite cupons exclusivos!',
      }
    : {
        A: `${product.titleBase} - Qualidade ${brandName}`,
        I: `Confeccionado em ${material} premium para máximo conforto.`,
        D: `${product.variants.length} variações disponíveis. Encontre a sua!`,
        Act: 'Garanta o seu agora mesmo!',
      };

  const keywords = [
    productType.toLowerCase(),
    brandName.toLowerCase(),
    ...product.materials.map(m => m.toLowerCase().split(' ')).flat(),
    product.recipe,
    ...(product.category?.toLowerCase().split(' > ') || []),
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 10);

  return {
    title_short: titleShort.slice(0, 60),
    title_long_tail: titleLongTail.slice(0, 200),
    bullets,
    aida,
    keywords,
  };
}

export interface MerchantFormatResult {
  aiDisclosure: {
    useStructured: boolean;
    structured_title?: { digitalSourceType: 'trained_algorithmic_media'; content: string };
    structured_description?: { digitalSourceType: 'trained_algorithmic_media'; content: string };
  };
}

export function formatMerchant(product: Product, copy: CopyPayload): MerchantFormatResult {
  return {
    aiDisclosure: {
      useStructured: true,
      structured_title: {
        digitalSourceType: 'trained_algorithmic_media',
        content: copy.title_short,
      },
      structured_description: {
        digitalSourceType: 'trained_algorithmic_media',
        content: `${copy.aida.I} ${copy.aida.D}`,
      },
    },
  };
}

export interface GuardResult {
  passed: boolean;
  blockers: string[];
  riskFlags: string[];
}

export function guard(copy: CopyPayload, attrs: Record<string, any>, product: Product): GuardResult {
  const blockers: string[] = [];
  const riskFlags: string[] = [];

  // Check for forbidden claims
  const forbiddenClaims = ['melhor', 'único', 'garantido', 'milagroso', 'revolucionário'];
  const allText = `${copy.title_short} ${copy.title_long_tail} ${copy.bullets.join(' ')} ${Object.values(copy.aida).join(' ')}`.toLowerCase();
  
  forbiddenClaims.forEach(claim => {
    if (allText.includes(claim)) {
      riskFlags.push(`Termo potencialmente problemático: "${claim}"`);
    }
  });

  // Check consistency
  if (copy.bullets.length < 3) {
    blockers.push('Mínimo 3 bullet points requeridos');
  }

  if (copy.title_short.length < 20) {
    blockers.push('Título muito curto');
  }

  if (copy.keywords.length < 5) {
    riskFlags.push('Poucos keywords podem afetar busca');
  }

  // Check material consistency
  const materialMentioned = product.materials.some(m => 
    allText.includes(m.toLowerCase())
  );
  if (!materialMentioned) {
    riskFlags.push('Material do produto não mencionado no copy');
  }

  return {
    passed: blockers.length === 0,
    blockers,
    riskFlags,
  };
}

export interface EnhancedPhotosResult {
  photos: MediaAsset[];
  improvements: string[];
}

export function enhanceImages(photos: MediaAsset[]): EnhancedPhotosResult {
  const enhanced = photos
    .filter(p => p.track === 'listing_safe')
    .map(p => ({
      ...p,
      id: `enhanced-${p.id}`,
      enhanced: true,
    }));

  return {
    photos: enhanced,
    improvements: [
      'Brilho e contraste otimizados',
      'Fundo padronizado para marketplace',
      'Cores corrigidas para fidelidade',
    ],
  };
}

export interface CreativePhotosResult {
  photos: MediaAsset[];
}

export function generateCreatives(photos: MediaAsset[]): CreativePhotosResult {
  const creatives: MediaAsset[] = [
    {
      id: `creative-lifestyle-${Date.now()}`,
      role: 'lifestyle',
      track: 'creative_only',
      urlMock: photos[0]?.urlMock || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
      filename: 'lifestyle_generated.jpg',
    },
  ];

  return { photos: creatives };
}

export interface GeneratedVideosResult {
  videos: VideoAsset[];
}

export function generateVideos(photos: MediaAsset[]): GeneratedVideosResult {
  const videos: VideoAsset[] = [
    {
      id: `video-${Date.now()}`,
      format: '9:16',
      track: 'creative_only',
      urlMock: '/mock/generated_video.mp4',
      filename: 'product_video.mp4',
      duration: 15,
    },
  ];

  return { videos };
}

// Helper to create AI run records
export function createAIRun(productId: string, stage: AIRun['stage'], status: AIRun['status'] = 'ok'): AIRun {
  const now = new Date().toISOString();
  return {
    id: `air-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    productId,
    stage,
    status,
    model: stage.includes('img') || stage.includes('video') ? 'stable-diffusion-xl' : 'gpt-4-turbo',
    provider: stage.includes('img') || stage.includes('video') ? 'stability' : 'openai',
    cost: Math.random() * 0.5,
    startedAt: now,
    endedAt: now,
    summary: getStageSummary(stage),
  };
}

function getStageSummary(stage: AIRun['stage']): string {
  const summaries: Record<AIRun['stage'], string> = {
    vision: 'Análise de imagens concluída com 92% de confiança',
    attrs: 'Atributos preenchidos automaticamente',
    copy: 'Textos gerados no formato AIDA',
    merchant: 'Campos estruturados formatados para Merchant Center',
    guard: 'Verificação de compliance aprovada',
    img_enhance: 'Imagens otimizadas para listagem',
    img_generate: 'Imagens criativas geradas',
    video_generate: 'Vídeo de produto gerado',
  };
  return summaries[stage];
}
