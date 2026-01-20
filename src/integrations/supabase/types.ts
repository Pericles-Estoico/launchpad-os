export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          payload: Json | null
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_runs: {
        Row: {
          created_at: string
          duration_ms: number | null
          id: string
          input: Json | null
          output: Json | null
          product_id: string | null
          stage: string
          status: string | null
          tokens_used: number | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          input?: Json | null
          output?: Json | null
          product_id?: string | null
          stage: string
          status?: string | null
          tokens_used?: number | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          input?: Json | null
          output?: Json | null
          product_id?: string | null
          stage?: string
          status?: string | null
          tokens_used?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_runs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_runs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      gate_defs: {
        Row: {
          checklist: Json | null
          created_at: string
          gate_key: string
          gate_order: number
          id: string
          marketplace: Database["public"]["Enums"]["marketplace_key"]
          name: string
          requires_auditor: boolean | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          checklist?: Json | null
          created_at?: string
          gate_key: string
          gate_order: number
          id?: string
          marketplace: Database["public"]["Enums"]["marketplace_key"]
          name: string
          requires_auditor?: boolean | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          checklist?: Json | null
          created_at?: string
          gate_key?: string
          gate_order?: number
          id?: string
          marketplace?: Database["public"]["Enums"]["marketplace_key"]
          name?: string
          requires_auditor?: boolean | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gate_defs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      gate_runs: {
        Row: {
          checklist_status: Json | null
          created_at: string
          evidence: Json | null
          gate_def_id: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["gate_status"]
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          checklist_status?: Json | null
          created_at?: string
          evidence?: Json | null
          gate_def_id: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["gate_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          checklist_status?: Json | null
          created_at?: string
          evidence?: Json | null
          gate_def_id?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["gate_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gate_runs_gate_def_id_fkey"
            columns: ["gate_def_id"]
            isOneToOne: false
            referencedRelation: "gate_defs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gate_runs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_drafts: {
        Row: {
          attributes: Json | null
          blockers: Json | null
          copy: Json | null
          created_at: string
          id: string
          marketplace: Database["public"]["Enums"]["marketplace_key"]
          product_id: string
          published_at: string | null
          readiness_score: number | null
          selected_photos: Json | null
          status: Database["public"]["Enums"]["listing_status"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          attributes?: Json | null
          blockers?: Json | null
          copy?: Json | null
          created_at?: string
          id?: string
          marketplace: Database["public"]["Enums"]["marketplace_key"]
          product_id: string
          published_at?: string | null
          readiness_score?: number | null
          selected_photos?: Json | null
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          attributes?: Json | null
          blockers?: Json | null
          copy?: Json | null
          created_at?: string
          id?: string
          marketplace?: Database["public"]["Enums"]["marketplace_key"]
          product_id?: string
          published_at?: string | null
          readiness_score?: number | null
          selected_photos?: Json | null
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_drafts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_drafts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      media_sets: {
        Row: {
          created_at: string
          hero_index: number | null
          id: string
          photos: Json | null
          product_id: string
          report: Json | null
          updated_at: string
          videos: Json | null
        }
        Insert: {
          created_at?: string
          hero_index?: number | null
          id?: string
          photos?: Json | null
          product_id: string
          report?: Json | null
          updated_at?: string
          videos?: Json | null
        }
        Update: {
          created_at?: string
          hero_index?: number | null
          id?: string
          photos?: Json | null
          product_id?: string
          report?: Json | null
          updated_at?: string
          videos?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "media_sets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_feed_rows: {
        Row: {
          ai_disclosure: Json | null
          created_at: string
          fields: Json | null
          id: string
          last_synced_at: string | null
          product_id: string
          updated_at: string
          validation: Json | null
          workspace_id: string
        }
        Insert: {
          ai_disclosure?: Json | null
          created_at?: string
          fields?: Json | null
          id?: string
          last_synced_at?: string | null
          product_id: string
          updated_at?: string
          validation?: Json | null
          workspace_id: string
        }
        Update: {
          ai_disclosure?: Json | null
          created_at?: string
          fields?: Json | null
          id?: string
          last_synced_at?: string | null
          product_id?: string
          updated_at?: string
          validation?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_feed_rows_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchant_feed_rows_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number | null
          brand: string | null
          category: string | null
          created_at: string
          description: string | null
          dimensions: Json | null
          id: string
          inventory: Json | null
          sku: string
          status: string | null
          title: string
          updated_at: string
          variants: Json | null
          workspace_id: string
        }
        Insert: {
          base_price?: number | null
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          id?: string
          inventory?: Json | null
          sku: string
          status?: string | null
          title: string
          updated_at?: string
          variants?: Json | null
          workspace_id: string
        }
        Update: {
          base_price?: number | null
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          id?: string
          inventory?: Json | null
          sku?: string
          status?: string | null
          title?: string
          updated_at?: string
          variants?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      requirements_library: {
        Row: {
          categories: Json | null
          created_at: string
          id: string
          marketplace: Database["public"]["Enums"]["marketplace_key"]
          updated_at: string
          version: string | null
          workspace_id: string
        }
        Insert: {
          categories?: Json | null
          created_at?: string
          id?: string
          marketplace: Database["public"]["Enums"]["marketplace_key"]
          updated_at?: string
          version?: string | null
          workspace_id: string
        }
        Update: {
          categories?: Json | null
          created_at?: string
          id?: string
          marketplace?: Database["public"]["Enums"]["marketplace_key"]
          updated_at?: string
          version?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirements_library_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      war_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          marketplace: Database["public"]["Enums"]["marketplace_key"] | null
          priority: number | null
          related_id: string | null
          status: Database["public"]["Enums"]["war_task_status"]
          task_type: Database["public"]["Enums"]["war_task_type"]
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          marketplace?: Database["public"]["Enums"]["marketplace_key"] | null
          priority?: number | null
          related_id?: string | null
          status?: Database["public"]["Enums"]["war_task_status"]
          task_type: Database["public"]["Enums"]["war_task_type"]
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          marketplace?: Database["public"]["Enums"]["marketplace_key"] | null
          priority?: number | null
          related_id?: string | null
          status?: Database["public"]["Enums"]["war_task_status"]
          task_type?: Database["public"]["Enums"]["war_task_type"]
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "war_tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          plan: string | null
          seller_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          plan?: string | null
          seller_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          plan?: string | null
          seller_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_workspace_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "cadastro" | "catalogo" | "auditor"
      gate_status: "locked" | "open" | "pending" | "approved" | "rejected"
      listing_status: "draft" | "review" | "ready" | "published" | "error"
      marketplace_key: "mercadolivre" | "shopee" | "amazon" | "magalu"
      war_task_status: "backlog" | "todo" | "in_progress" | "done" | "blocked"
      war_task_type: "gate" | "listing" | "optimization" | "support"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "cadastro", "catalogo", "auditor"],
      gate_status: ["locked", "open", "pending", "approved", "rejected"],
      listing_status: ["draft", "review", "ready", "published", "error"],
      marketplace_key: ["mercadolivre", "shopee", "amazon", "magalu"],
      war_task_status: ["backlog", "todo", "in_progress", "done", "blocked"],
      war_task_type: ["gate", "listing", "optimization", "support"],
    },
  },
} as const
