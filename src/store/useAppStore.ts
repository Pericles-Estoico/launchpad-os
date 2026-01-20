import { create } from 'zustand';
import { 
  User, 
  Workspace, 
  Product, 
  GateRun, 
  ListingDraft, 
  MerchantFeedRow, 
  WarTask, 
  Activity, 
  MediaSet,
  RequirementsLibraryItem,
  GateDef,
  AIRun,
  MarketplaceKey,
  GateStatus,
  EvidenceRef,
} from '@/lib/types';
import {
  seedWorkspace,
  seedUsers,
  seedProducts,
  seedGateRuns,
  seedListingDrafts,
  seedMerchantFeedRows,
  seedWarTasks,
  seedActivities,
  seedMediaSets,
  seedRequirements,
  seedGateDefs,
} from '@/lib/seed';

interface AppState {
  // Current user (simulated auth)
  currentUser: User;
  setCurrentUser: (user: User) => void;
  
  // Workspace
  workspace: Workspace;
  
  // Users
  users: User[];
  
  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Media Sets
  mediaSets: MediaSet[];
  updateMediaSet: (id: string, updates: Partial<MediaSet>) => void;
  addMediaSet: (mediaSet: MediaSet) => void;
  
  // Gates
  gateDefs: GateDef[];
  gateRuns: GateRun[];
  updateGateRun: (id: string, updates: Partial<GateRun>) => void;
  addEvidenceToGate: (gateId: string, evidence: EvidenceRef) => void;
  
  // Requirements
  requirements: RequirementsLibraryItem[];
  addRequirement: (requirement: RequirementsLibraryItem) => void;
  updateRequirements: (id: string, updates: Partial<RequirementsLibraryItem>) => void;
  deleteRequirement: (id: string) => void;
  
  // Gate Defs
  addGateDef: (gateDef: GateDef) => void;
  updateGateDef: (id: string, updates: Partial<GateDef>) => void;
  deleteGateDef: (id: string) => void;
  
  // Users
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  
  // Listings
  listingDrafts: ListingDraft[];
  addListingDraft: (draft: ListingDraft) => void;
  updateListingDraft: (id: string, updates: Partial<ListingDraft>) => void;
  deleteListingDraft: (id: string) => void;
  
  // Merchant Feed
  merchantFeedRows: MerchantFeedRow[];
  updateMerchantFeedRow: (id: string, updates: Partial<MerchantFeedRow>) => void;
  addMerchantFeedRow: (row: MerchantFeedRow) => void;
  
  // War Tasks
  warTasks: WarTask[];
  addWarTask: (task: WarTask) => void;
  updateWarTask: (id: string, updates: Partial<WarTask>) => void;
  
  // Activities
  activities: Activity[];
  addActivity: (activity: Activity) => void;
  
  // AI Runs
  aiRuns: AIRun[];
  addAIRun: (run: AIRun) => void;
  
  // UI State
  selectedMarketplace: MarketplaceKey;
  setSelectedMarketplace: (marketplace: MarketplaceKey) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state from seed
  currentUser: seedUsers[0], // Start as admin
  workspace: seedWorkspace,
  users: seedUsers,
  products: seedProducts,
  mediaSets: seedMediaSets,
  gateDefs: seedGateDefs,
  gateRuns: seedGateRuns,
  requirements: seedRequirements,
  listingDrafts: seedListingDrafts,
  merchantFeedRows: seedMerchantFeedRows,
  warTasks: seedWarTasks,
  activities: seedActivities,
  aiRuns: [],
  selectedMarketplace: 'mercadolivre',
  
  // Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  
  addProduct: (product) => set((state) => ({ 
    products: [...state.products, product] 
  })),
  
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map((p) => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ),
  })),
  
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id),
  })),
  
  updateMediaSet: (id, updates) => set((state) => ({
    mediaSets: state.mediaSets.map((ms) =>
      ms.id === id ? { ...ms, ...updates } : ms
    ),
  })),
  
  addMediaSet: (mediaSet) => set((state) => ({
    mediaSets: [...state.mediaSets, mediaSet],
  })),
  
  updateGateRun: (id, updates) => set((state) => ({
    gateRuns: state.gateRuns.map((gr) =>
      gr.id === id ? { ...gr, ...updates } : gr
    ),
  })),
  
  addEvidenceToGate: (gateId, evidence) => set((state) => ({
    gateRuns: state.gateRuns.map((gr) =>
      gr.id === gateId 
        ? { ...gr, evidence: [...gr.evidence, evidence] } 
        : gr
    ),
  })),

  addRequirement: (requirement) => set((state) => ({
    requirements: [...state.requirements, requirement],
  })),
  
  updateRequirements: (id, updates) => set((state) => ({
    requirements: state.requirements.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    ),
  })),

  deleteRequirement: (id) => set((state) => ({
    requirements: state.requirements.filter((r) => r.id !== id),
  })),

  addGateDef: (gateDef) => set((state) => ({
    gateDefs: [...state.gateDefs, gateDef],
  })),

  updateGateDef: (id, updates) => set((state) => ({
    gateDefs: state.gateDefs.map((g) =>
      g.id === id ? { ...g, ...updates } : g
    ),
  })),

  deleteGateDef: (id) => set((state) => ({
    gateDefs: state.gateDefs.filter((g) => g.id !== id),
  })),

  addUser: (user) => set((state) => ({
    users: [...state.users, user],
  })),

  updateUser: (id, updates) => set((state) => ({
    users: state.users.map((u) =>
      u.id === id ? { ...u, ...updates } : u
    ),
  })),
  
  addListingDraft: (draft) => set((state) => ({
    listingDrafts: [...state.listingDrafts, draft],
  })),
  
  updateListingDraft: (id, updates) => set((state) => ({
    listingDrafts: state.listingDrafts.map((ld) =>
      ld.id === id ? { ...ld, ...updates, updatedAt: new Date().toISOString() } : ld
    ),
  })),
  
  deleteListingDraft: (id) => set((state) => ({
    listingDrafts: state.listingDrafts.filter((ld) => ld.id !== id),
  })),
  
  updateMerchantFeedRow: (id, updates) => set((state) => ({
    merchantFeedRows: state.merchantFeedRows.map((mf) =>
      mf.id === id ? { ...mf, ...updates } : mf
    ),
  })),
  
  addMerchantFeedRow: (row) => set((state) => ({
    merchantFeedRows: [...state.merchantFeedRows, row],
  })),
  
  addWarTask: (task) => set((state) => ({
    warTasks: [...state.warTasks, task],
  })),
  
  updateWarTask: (id, updates) => set((state) => ({
    warTasks: state.warTasks.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    ),
  })),
  
  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities],
  })),
  
  addAIRun: (run) => set((state) => ({
    aiRuns: [...state.aiRuns, run],
  })),
  
  setSelectedMarketplace: (marketplace) => set({ selectedMarketplace: marketplace }),
}));

// Role permission helpers
export const canAccess = (user: User, requiredRoles: User['role'][]): boolean => {
  if (user.role === 'admin') return true;
  return requiredRoles.includes(user.role);
};

export const getRoleLabel = (role: User['role']): string => {
  const labels: Record<User['role'], string> = {
    admin: 'Administrador',
    cadastro: 'Cadastro',
    catalogo: 'Catálogo',
    auditor: 'Auditor',
  };
  return labels[role];
};

export const getRoleColor = (role: User['role']): string => {
  const colors: Record<User['role'], string> = {
    admin: 'bg-primary text-primary-foreground',
    cadastro: 'bg-info/10 text-info',
    catalogo: 'bg-success/10 text-success',
    auditor: 'bg-warning/10 text-warning',
  };
  return colors[role];
};
