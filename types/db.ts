// Hand-written types matching the migration schema.
// Once Supabase project is created, replace with: npx supabase gen types typescript

export type CustomerType = "residential" | "commercial" | "government" | "industrial";
export type EstimateStatus = "draft" | "review" | "approved" | "won" | "lost";
export type LineItemType = "catalog_item" | "assembly" | "labor" | "custom";
export type ProposalStatus = "draft" | "sent" | "viewed" | "signed" | "rejected";
export type OpportunityStage = "lead" | "proposal_sent" | "negotiation" | "won" | "lost";
export type Unit = "each" | "ft" | "sqft" | "hr" | "lot" | "pr";
export type ComponentType = "material" | "labor";

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  customer_id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  created_at: string;
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
  name: string;
  status: EstimateStatus;
  overhead_pct: number;
  profit_pct: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
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

// Supabase Database type wrapper (used by createClient generics)
export type Database = {
  public: {
    Tables: {
      customers: { Row: Customer; Insert: Omit<Customer, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Customer, "id">>; };
      contacts: { Row: Contact; Insert: Omit<Contact, "id" | "created_at">; Update: Partial<Omit<Contact, "id">>; };
      catalog_categories: { Row: CatalogCategory; Insert: Omit<CatalogCategory, "id">; Update: Partial<Omit<CatalogCategory, "id">>; };
      catalog_items: { Row: CatalogItem; Insert: Omit<CatalogItem, "id" | "created_at" | "updated_at">; Update: Partial<Omit<CatalogItem, "id">>; };
      assemblies: { Row: Assembly; Insert: Omit<Assembly, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Assembly, "id">>; };
      assembly_components: { Row: AssemblyComponent; Insert: Omit<AssemblyComponent, "id">; Update: Partial<Omit<AssemblyComponent, "id">>; };
      estimates: { Row: Estimate; Insert: Omit<Estimate, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Estimate, "id">>; };
      estimate_sections: { Row: EstimateSection; Insert: Omit<EstimateSection, "id">; Update: Partial<Omit<EstimateSection, "id">>; };
      estimate_line_items: { Row: EstimateLineItem; Insert: Omit<EstimateLineItem, "id" | "created_at">; Update: Partial<Omit<EstimateLineItem, "id">>; };
      proposals: { Row: Proposal; Insert: Omit<Proposal, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Proposal, "id">>; };
      opportunities: { Row: Opportunity; Insert: Omit<Opportunity, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Opportunity, "id">>; };
    };
  };
};
