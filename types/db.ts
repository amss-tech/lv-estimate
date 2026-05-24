// Generated from live schema (ptnphqlfmmivkcbrgkso) — do not hand-edit the Database block

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assemblies: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assemblies_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      assembly_components: {
        Row: {
          assembly_id: string
          catalog_item_id: string | null
          id: string
          labor_description: string | null
          override_unit_cost: number | null
          quantity: number
          sort_order: number
          type: string
        }
        Insert: {
          assembly_id: string
          catalog_item_id?: string | null
          id?: string
          labor_description?: string | null
          override_unit_cost?: number | null
          quantity?: number
          sort_order?: number
          type: string
        }
        Update: {
          assembly_id?: string
          catalog_item_id?: string | null
          id?: string
          labor_description?: string | null
          override_unit_cost?: number | null
          quantity?: number
          sort_order?: number
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "assembly_components_assembly_id_fkey"
            columns: ["assembly_id"]
            isOneToOne: false
            referencedRelation: "assemblies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assembly_components_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_categories: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "catalog_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_items: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          labor_hours: number
          list_price: number | null
          manufacturer: string | null
          model_number: string | null
          name: string
          sku: string | null
          unit: string
          unit_cost: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          labor_hours?: number
          list_price?: number | null
          manufacturer?: string | null
          model_number?: string | null
          name: string
          sku?: string | null
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          labor_hours?: number
          list_price?: number | null
          manufacturer?: string | null
          model_number?: string | null
          name?: string
          sku?: string | null
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "catalog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          customer_id: string
          email: string | null
          id: string
          is_primary: boolean
          location_id: string | null
          name: string
          phone: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          email?: string | null
          id?: string
          is_primary?: boolean
          location_id?: string | null
          name: string
          phone?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          location_id?: string | null
          name?: string
          phone?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "customer_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_locations: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          customer_id: string
          email: string | null
          id: string
          label: string | null
          notes: string | null
          phone: string | null
          sort_order: number
          state: string | null
          type: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          customer_id: string
          email?: string | null
          id?: string
          label?: string | null
          notes?: string | null
          phone?: string | null
          sort_order?: number
          state?: string | null
          type?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          customer_id?: string
          email?: string | null
          id?: string
          label?: string | null
          notes?: string | null
          phone?: string | null
          sort_order?: number
          state?: string | null
          type?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_locations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      estimate_line_items: {
        Row: {
          assembly_id: string | null
          catalog_item_id: string | null
          created_at: string
          description: string | null
          estimate_id: string
          id: string
          labor_hours: number
          name: string
          quantity: number
          section_id: string | null
          sort_order: number
          type: string
          unit: string
          unit_cost: number
          unit_price: number
        }
        Insert: {
          assembly_id?: string | null
          catalog_item_id?: string | null
          created_at?: string
          description?: string | null
          estimate_id: string
          id?: string
          labor_hours?: number
          name: string
          quantity?: number
          section_id?: string | null
          sort_order?: number
          type: string
          unit?: string
          unit_cost?: number
          unit_price?: number
        }
        Update: {
          assembly_id?: string | null
          catalog_item_id?: string | null
          created_at?: string
          description?: string | null
          estimate_id?: string
          id?: string
          labor_hours?: number
          name?: string
          quantity?: number
          section_id?: string | null
          sort_order?: number
          type?: string
          unit?: string
          unit_cost?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_line_items_assembly_id_fkey"
            columns: ["assembly_id"]
            isOneToOne: false
            referencedRelation: "assemblies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_line_items_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_line_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimate_line_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "estimate_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_sections: {
        Row: {
          estimate_id: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          estimate_id: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          estimate_id?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "estimate_sections_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          name: string
          notes: string | null
          overhead_pct: number
          profit_pct: number
          site_location_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          name: string
          notes?: string | null
          overhead_pct?: number
          profit_pct?: number
          site_location_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          overhead_pct?: number
          profit_pct?: number
          site_location_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimates_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_site_location_id_fkey"
            columns: ["site_location_id"]
            isOneToOne: false
            referencedRelation: "customer_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          assigned_to: string | null
          created_at: string
          customer_id: string | null
          estimate_id: string | null
          expected_close: string | null
          id: string
          lost_at: string | null
          lost_reason: string | null
          name: string
          notes: string | null
          probability: number | null
          stage: string
          updated_at: string
          value: number | null
          won_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          estimate_id?: string | null
          expected_close?: string | null
          id?: string
          lost_at?: string | null
          lost_reason?: string | null
          name: string
          notes?: string | null
          probability?: number | null
          stage?: string
          updated_at?: string
          value?: number | null
          won_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          estimate_id?: string | null
          expected_close?: string | null
          id?: string
          lost_at?: string | null
          lost_reason?: string | null
          name?: string
          notes?: string | null
          probability?: number | null
          stage?: string
          updated_at?: string
          value?: number | null
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          created_at: string
          customer_id: string | null
          estimate_id: string | null
          id: string
          notes: string | null
          pdf_url: string | null
          sent_at: string | null
          signed_at: string | null
          status: string
          terms: string | null
          title: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          estimate_id?: string | null
          id?: string
          notes?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          signed_at?: string | null
          status?: string
          terms?: string | null
          title: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          estimate_id?: string | null
          id?: string
          notes?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          signed_at?: string | null
          status?: string
          terms?: string | null
          title?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ── App-level literal types (narrower than the DB's plain `string`) ──────────

export type CustomerType = "residential" | "commercial" | "government" | "industrial";
export type LocationType = "main" | "billing" | "site";
export type EstimateStatus = "draft" | "review" | "approved" | "won" | "lost";
export type LineItemType = "catalog_item" | "assembly" | "labor" | "custom";
export type ProposalStatus = "draft" | "sent" | "viewed" | "signed" | "rejected";
export type OpportunityStage = "lead" | "proposal_sent" | "negotiation" | "won" | "lost";
export type Unit = "each" | "ft" | "sqft" | "hr" | "lot" | "pr";
export type ComponentType = "material" | "labor";

// ── Convenience aliases with literal types + optional relation fields ─────────

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerLocation {
  id: string;
  customer_id: string;
  type: LocationType;
  label: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

export interface Contact {
  id: string;
  customer_id: string;
  location_id: string | null;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  created_at: string;
  location?: CustomerLocation;
}

export interface CatalogCategory {
  id: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
}

export interface CatalogItem {
  id: string;
  category_id: string | null;
  sku: string | null;
  name: string;
  description: string | null;
  manufacturer: string | null;
  model_number: string | null;
  unit: Unit;
  unit_cost: number;
  list_price: number | null;
  labor_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Assembly {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssemblyComponent {
  id: string;
  assembly_id: string;
  type: ComponentType;
  catalog_item_id: string | null;
  labor_description: string | null;
  quantity: number;
  override_unit_cost: number | null;
  sort_order: number;
  catalog_item?: CatalogItem;
}

export interface Estimate {
  id: string;
  customer_id: string | null;
  site_location_id: string | null;
  name: string;
  status: EstimateStatus;
  overhead_pct: number;
  profit_pct: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  site_location?: CustomerLocation;
}

export interface EstimateSection {
  id: string;
  estimate_id: string;
  name: string;
  sort_order: number;
}

export interface EstimateLineItem {
  id: string;
  estimate_id: string;
  section_id: string | null;
  type: LineItemType;
  catalog_item_id: string | null;
  assembly_id: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_cost: number;
  unit_price: number;
  labor_hours: number;
  sort_order: number;
  created_at: string;
}

export interface Proposal {
  id: string;
  estimate_id: string | null;
  customer_id: string | null;
  title: string;
  status: ProposalStatus;
  valid_until: string | null;
  terms: string | null;
  notes: string | null;
  pdf_url: string | null;
  sent_at: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  estimate?: Estimate;
}

export interface Opportunity {
  id: string;
  customer_id: string | null;
  estimate_id: string | null;
  name: string;
  value: number | null;
  stage: OpportunityStage;
  probability: number | null;
  expected_close: string | null;
  assigned_to: string | null;
  lost_reason: string | null;
  won_at: string | null;
  lost_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}
