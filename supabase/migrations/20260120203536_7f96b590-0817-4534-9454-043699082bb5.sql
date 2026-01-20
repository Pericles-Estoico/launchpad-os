
-- =============================================
-- MARKETPLACE LAUNCH OS - COMPLETE SCHEMA
-- =============================================

-- 1. ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'cadastro', 'catalogo', 'auditor');
CREATE TYPE public.marketplace_key AS ENUM ('mercadolivre', 'shopee', 'amazon', 'magalu');
CREATE TYPE public.gate_status AS ENUM ('locked', 'open', 'pending', 'approved', 'rejected');
CREATE TYPE public.listing_status AS ENUM ('draft', 'review', 'ready', 'published', 'error');
CREATE TYPE public.war_task_status AS ENUM ('backlog', 'todo', 'in_progress', 'done', 'blocked');
CREATE TYPE public.war_task_type AS ENUM ('gate', 'listing', 'optimization', 'support');

-- 2. CORE TABLES
-- =============================================

-- Profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Roles (separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'cadastro',
  UNIQUE (user_id, role)
);

-- Workspaces
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  seller_id TEXT,
  plan TEXT DEFAULT 'starter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workspace Members
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

-- 3. PIM MODULE
-- =============================================

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  sku TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  category TEXT,
  variants JSONB DEFAULT '[]'::jsonb,
  dimensions JSONB,
  inventory JSONB DEFAULT '{"stock": 0, "warehouse": "default"}'::jsonb,
  base_price DECIMAL(10,2),
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Media Sets
CREATE TABLE public.media_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  photos JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb,
  hero_index INTEGER DEFAULT 0,
  report JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. GATES & REQUIREMENTS
-- =============================================

-- Requirements Library
CREATE TABLE public.requirements_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  marketplace marketplace_key NOT NULL,
  version TEXT DEFAULT '1.0',
  categories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gate Definitions
CREATE TABLE public.gate_defs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  marketplace marketplace_key NOT NULL,
  gate_key TEXT NOT NULL,
  gate_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  requires_auditor BOOLEAN DEFAULT false,
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gate Runs
CREATE TABLE public.gate_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  gate_def_id UUID REFERENCES public.gate_defs(id) ON DELETE CASCADE NOT NULL,
  status gate_status NOT NULL DEFAULT 'locked',
  checklist_status JSONB DEFAULT '{}'::jsonb,
  evidence JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. LISTINGS
-- =============================================

-- Listing Drafts
CREATE TABLE public.listing_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  marketplace marketplace_key NOT NULL,
  copy JSONB DEFAULT '{"title": "", "bullets": [], "description": ""}'::jsonb,
  attributes JSONB DEFAULT '{}'::jsonb,
  selected_photos JSONB DEFAULT '[]'::jsonb,
  readiness_score INTEGER DEFAULT 0,
  blockers JSONB DEFAULT '[]'::jsonb,
  status listing_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Merchant Feed Rows
CREATE TABLE public.merchant_feed_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  fields JSONB DEFAULT '{}'::jsonb,
  ai_disclosure JSONB,
  validation JSONB,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. WAR ROOM & ACTIVITIES
-- =============================================

-- War Tasks
CREATE TABLE public.war_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type war_task_type NOT NULL,
  status war_task_status NOT NULL DEFAULT 'backlog',
  priority INTEGER DEFAULT 0,
  marketplace marketplace_key,
  related_id UUID,
  assigned_to UUID REFERENCES auth.users(id),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activities
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Runs
CREATE TABLE public.ai_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  input JSONB,
  output JSONB,
  tokens_used INTEGER DEFAULT 0,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. INDEXES
-- =============================================
CREATE INDEX idx_products_workspace ON public.products(workspace_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_listing_drafts_workspace ON public.listing_drafts(workspace_id);
CREATE INDEX idx_listing_drafts_product ON public.listing_drafts(product_id);
CREATE INDEX idx_gate_runs_workspace ON public.gate_runs(workspace_id);
CREATE INDEX idx_activities_workspace ON public.activities(workspace_id);
CREATE INDEX idx_activities_created ON public.activities(created_at DESC);

-- 8. SECURITY DEFINER FUNCTION (for RLS)
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_workspace_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id
  FROM public.workspace_members
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 9. ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_defs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_feed_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.war_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_runs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles policies (read-only for users, managed by admins)
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Workspace policies
CREATE POLICY "Members can view workspace" ON public.workspaces FOR SELECT
  USING (id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Admins can update workspace" ON public.workspaces FOR UPDATE
  USING (id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- Workspace members policies
CREATE POLICY "Members can view workspace members" ON public.workspace_members FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

-- Products policies
CREATE POLICY "Members can view products" ON public.products FOR SELECT
  USING (workspace_id = public.get_user_workspace_id(auth.uid()));
CREATE POLICY "Members can insert products" ON public.products FOR INSERT
  WITH CHECK (workspace_id = public.get_user_workspace_id(auth.uid()));
CREATE POLICY "Members can update products" ON public.products FOR UPDATE
  USING (workspace_id = public.get_user_workspace_id(auth.uid()));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE
  USING (workspace_id = public.get_user_workspace_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- Media sets policies
CREATE POLICY "Members can view media" ON public.media_sets FOR SELECT
  USING (product_id IN (SELECT id FROM public.products WHERE workspace_id = public.get_user_workspace_id(auth.uid())));
CREATE POLICY "Members can manage media" ON public.media_sets FOR ALL
  USING (product_id IN (SELECT id FROM public.products WHERE workspace_id = public.get_user_workspace_id(auth.uid())));

-- Requirements library policies
CREATE POLICY "Members can view requirements" ON public.requirements_library FOR SELECT
  USING (workspace_id = public.get_user_workspace_id(auth.uid()));
CREATE POLICY "Admins can manage requirements" ON public.requirements_library FOR ALL
  USING (workspace_id = public.get_user_workspace_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- Gate defs policies
CREATE POLICY "Members can view gate defs" ON public.gate_defs FOR SELECT
  USING (workspace_id = public.get_user_workspace_id(auth.uid()));
CREATE POLICY "Admins can manage gate defs" ON public.gate_defs FOR ALL
  USING (workspace_id = public.get_user_workspace_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'));

-- Gate runs policies
CREATE POLICY "Members can view gate runs" ON public.gate_runs FOR SELECT
  USING (workspace_id = public.get_user_workspace_id(auth.uid()));
CREATE POLICY "Members can update gate runs" ON public.gate_runs FOR UPDATE
  USING (workspace_id = public.get_user_workspace_id(auth.uid()));
CREATE POLICY "Cadastro can insert gate runs" ON public.gate_runs FOR INSERT
  WITH CHECK (workspace_id = public.get_user_workspace_id(auth.uid()));

-- Listing drafts policies
CREATE POLICY "Members can view listings" ON public.listing_drafts FOR SELECT
  USING (workspace_id = public.get_user_workspace_id(auth.uid()));
CREATE POLICY "Members can manage listings" ON public.listing_drafts FOR ALL
  USING (workspace_id = public.get_user_workspace_id(auth.uid()));

-- Merchant feed policies
CREATE POLICY "Members can view feed" ON public.merchant_feed_rows FOR SELECT
  USING (workspace_id = public.get_user_workspace_id(auth.uid()));
CREATE POLICY "Members can manage feed" ON public.merchant_feed_rows FOR ALL
  USING (workspace_id = public.get_user_workspace_id(auth.uid()));

-- War tasks policies
CREATE POLICY "Members can view tasks" ON public.war_tasks FOR SELECT
  USING (workspace_id = public.get_user_workspace_id(auth.uid()));
CREATE POLICY "Members can manage tasks" ON public.war_tasks FOR ALL
  USING (workspace_id = public.get_user_workspace_id(auth.uid()));

-- Activities policies
CREATE POLICY "Members can view activities" ON public.activities FOR SELECT
  USING (workspace_id = public.get_user_workspace_id(auth.uid()));
CREATE POLICY "Members can insert activities" ON public.activities FOR INSERT
  WITH CHECK (workspace_id = public.get_user_workspace_id(auth.uid()));

-- AI runs policies
CREATE POLICY "Members can view ai runs" ON public.ai_runs FOR SELECT
  USING (workspace_id = public.get_user_workspace_id(auth.uid()));
CREATE POLICY "Members can insert ai runs" ON public.ai_runs FOR INSERT
  WITH CHECK (workspace_id = public.get_user_workspace_id(auth.uid()));

-- 10. TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_media_sets_updated_at BEFORE UPDATE ON public.media_sets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gate_defs_updated_at BEFORE UPDATE ON public.gate_defs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gate_runs_updated_at BEFORE UPDATE ON public.gate_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_listing_drafts_updated_at BEFORE UPDATE ON public.listing_drafts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON public.requirements_library FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_war_tasks_updated_at BEFORE UPDATE ON public.war_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_merchant_feed_updated_at BEFORE UPDATE ON public.merchant_feed_rows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), NEW.email);
  
  -- Default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cadastro');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
