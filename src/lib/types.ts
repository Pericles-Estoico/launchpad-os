// Core Types for Marketplace Launch OS

export interface Workspace {
  id: string;
  name: string;
  cnpj: string;
  legalName: string;
  tradeName: string;
  address: string;
}

export type UserRole = 'admin' | 'cadastro' | 'catalogo' | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type MarketplaceKey = 'mercadolivre' | 'shopee' | 'shein' | 'tiktok' | 'kwai' | 'amazon';

export type Wave = 'wave1' | 'wave2';

export const MARKETPLACE_CONFIG: Record<MarketplaceKey, { name: string; wave: Wave; color: string; shortName: string }> = {
  mercadolivre: { name: 'Mercado Livre', wave: 'wave1', color: 'ml', shortName: 'ML' },
  shopee: { name: 'Shopee', wave: 'wave1', color: 'shopee', shortName: 'Shopee' },
  shein: { name: 'Shein', wave: 'wave2', color: 'shein', shortName: 'Shein' },
  tiktok: { name: 'TikTok Shop', wave: 'wave2', color: 'tiktok', shortName: 'TikTok' },
  kwai: { name: 'Kwai', wave: 'wave2', color: 'kwai', shortName: 'Kwai' },
  amazon: { name: 'Amazon', wave: 'wave2', color: 'amazon', shortName: 'Amazon' },
};

export type EvidenceType = 'document' | 'screenshot' | 'link' | 'api_response' | 'photo' | 'video';

export interface ReqItem {
  key: string;
  name: string;
  desc: string;
  evidenceTypes: EvidenceType[];
  status: 'missing' | 'uploaded' | 'verified';
  sourceLinks: string[];
}

export interface RequirementsLibraryItem {
  id: string;
  marketplaceKey: MarketplaceKey;
  accountType: 'PJ';
  country: 'BR';
  requirements: ReqItem[];
  lastReviewedAt: string;
}

export interface GateCheckItem {
  key: string;
  label: string;
  required: boolean;
}

export interface GateDef {
  id: string;
  marketplaceKey: MarketplaceKey;
  gateKey: string;
  name: string;
  order: number;
  requiresAuditor: boolean;
  checklist: GateCheckItem[];
  evidenceTypes: EvidenceType[];
}

export interface EvidenceRef {
  id: string;
  type: EvidenceType;
  filename: string;
  urlMock: string;
  uploadedAt: string;
}

export type GateStatus = 'locked' | 'in_progress' | 'submitted' | 'approved' | 'rejected';

export interface GateRun {
  id: string;
  workspaceId: string;
  marketplaceKey: MarketplaceKey;
  gateKey: string;
  gateName: string;
  status: GateStatus;
  checks: Record<string, boolean>;
  evidence: EvidenceRef[];
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  order: number;
}

export type ProductRecipe = 'apparel' | 'kit' | 'custom';

export interface ProductVariant {
  size: string;
  color: string;
  skuVariant: string;
}

export interface ProductDimensions {
  weight_g: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
}

export interface InventoryItem {
  skuVariant: string;
  qty: number;
}

export interface Product {
  id: string;
  skuMaster: string;
  recipe: ProductRecipe;
  brand: string;
  titleBase: string;
  description?: string;
  materials: string[];
  variants: ProductVariant[];
  dims: ProductDimensions;
  priceBRL: number;
  costBRL: number;
  inventory: InventoryItem[];
  mediaSetId?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export type MediaTrack = 'listing_safe' | 'creative_only';
export type MediaRole = 'hero' | 'detail' | 'variant' | 'lifestyle';

export interface MediaAsset {
  id: string;
  role: MediaRole;
  track: MediaTrack;
  urlMock: string;
  filename: string;
  enhanced?: boolean;
}

export interface VideoAsset {
  id: string;
  format: '9:16' | '16:9';
  track: 'creative_only';
  urlMock: string;
  filename: string;
  duration?: number;
}

export interface MediaReport {
  score: number;
  issues: string[];
}

export interface MediaSet {
  id: string;
  productId: string;
  photos: MediaAsset[];
  videos: VideoAsset[];
  report: MediaReport;
}

export interface CopyPayload {
  title_short: string;
  title_long_tail: string;
  bullets: string[];
  aida: {
    A: string; // Attention
    I: string; // Interest
    D: string; // Desire
    Act: string; // Action
  };
  keywords: string[];
}

export interface ListingReadiness {
  ready: boolean;
  score: number;
  blockers: string[];
}

export interface ListingDraft {
  id: string;
  productId: string;
  marketplaceKey: MarketplaceKey;
  attributes: Record<string, any>;
  copy: CopyPayload;
  readiness: ListingReadiness;
  publishGateKey: string;
  status: 'draft' | 'ready' | 'published';
  updatedAt: string;
}

export interface MerchantAIDisclosure {
  useStructured: boolean;
  structured_title?: {
    digitalSourceType: 'trained_algorithmic_media';
    content: string;
  };
  structured_description?: {
    digitalSourceType: 'trained_algorithmic_media';
    content: string;
  };
}

export interface MerchantValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MerchantFeedRow {
  id: string;
  productId: string;
  fields: {
    id: string;
    link: string;
    image_link: string;
    availability: 'in_stock' | 'out_of_stock' | 'preorder';
    price: string;
    brand: string;
    gtin?: string;
    mpn?: string;
    condition: 'new' | 'refurbished' | 'used';
    google_product_category: string;
    shipping_weight: string;
  };
  aiDisclosure: MerchantAIDisclosure;
  validation: MerchantValidation;
}

export type AIStage = 'vision' | 'attrs' | 'copy' | 'merchant' | 'guard' | 'img_enhance' | 'img_generate' | 'video_generate';

export interface AIRun {
  id: string;
  productId: string;
  stage: AIStage;
  status: 'pending' | 'running' | 'ok' | 'fail';
  model: string;
  provider: string;
  cost?: number;
  startedAt: string;
  endedAt?: string;
  summary?: string;
}

export type WarTaskType = 'setup' | 'listing' | 'merchant' | 'optimization';
export type WarTaskStatus = 'todo' | 'doing' | 'done';

export interface WarTask {
  id: string;
  date: string;
  marketplaceKey: MarketplaceKey;
  type: WarTaskType;
  title: string;
  priority: 1 | 2 | 3 | 4 | 5;
  impact: number; // 1-100
  ownerRole: UserRole;
  status: WarTaskStatus;
  notes?: string;
  result?: string;
}

// Activity feed
export interface Activity {
  id: string;
  type: 'gate_approved' | 'gate_rejected' | 'product_created' | 'listing_ready' | 'task_completed' | 'ai_run' | 'evidence_uploaded';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}
