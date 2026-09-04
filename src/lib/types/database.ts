export type Vibe =
  | "spiritual"
  | "glam"
  | "minimalist"
  | "gothic_romantic"
  | "funny";

export type CeremonyStatus = "planning" | "confirmed" | "completed";

export type OutreachStatus = "not_sent" | "sent" | "replied" | "booked";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          tier: "free" | "premium";
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          tier?: "free" | "premium";
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          email: string;
          name: string | null;
          tier: "free" | "premium";
          created_at: string;
        }>;
        Relationships: [];
      };
      vendor_categories: {
        Row: { id: string; slug: string; name: string };
        Insert: { id?: string; slug: string; name: string };
        Update: Partial<{ id: string; slug: string; name: string }>;
        Relationships: [];
      };
      ceremonies: {
        Row: {
          id: string;
          user_id: string;
          vibe: Vibe;
          reason: string | null;
          date: string | null;
          location: string | null;
          guest_count: number;
          budget_band: string | null;
          priority_ranking: string[];
          status: CeremonyStatus;
          ceremony_script: string | null;
          vows: string | null;
          witness_reading: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vibe: Vibe;
          reason?: string | null;
          date?: string | null;
          location?: string | null;
          guest_count?: number;
          budget_band?: string | null;
          priority_ranking?: string[];
          status?: CeremonyStatus;
          ceremony_script?: string | null;
          vows?: string | null;
          witness_reading?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          user_id: string;
          vibe: Vibe;
          reason: string | null;
          date: string | null;
          location: string | null;
          guest_count: number;
          budget_band: string | null;
          priority_ranking: string[];
          status: CeremonyStatus;
          ceremony_script: string | null;
          vows: string | null;
          witness_reading: string | null;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
      ceremony_timeline: {
        Row: {
          id: string;
          ceremony_id: string;
          moment_name: string;
          time: string | null;
          notes: string | null;
          order_index: number;
        };
        Insert: {
          id?: string;
          ceremony_id: string;
          moment_name: string;
          time?: string | null;
          notes?: string | null;
          order_index?: number;
        };
        Update: Partial<{
          id: string;
          ceremony_id: string;
          moment_name: string;
          time: string | null;
          notes: string | null;
          order_index: number;
        }>;
        Relationships: [];
      };
      vendor_shortlist: {
        Row: {
          id: string;
          ceremony_id: string;
          category_id: string;
          place_id: string;
          name: string;
          address: string | null;
          ai_rationale: string | null;
          selected: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          ceremony_id: string;
          category_id: string;
          place_id: string;
          name: string;
          address?: string | null;
          ai_rationale?: string | null;
          selected?: boolean;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          ceremony_id: string;
          category_id: string;
          place_id: string;
          name: string;
          address: string | null;
          ai_rationale: string | null;
          selected: boolean;
          created_at: string;
        }>;
        Relationships: [];
      };
      vendor_cache: {
        Row: {
          id: string;
          category_slug: string;
          location_key: string;
          results: unknown;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          category_slug: string;
          location_key: string;
          results: unknown;
          fetched_at?: string;
        };
        Update: Partial<{
          id: string;
          category_slug: string;
          location_key: string;
          results: unknown;
          fetched_at: string;
        }>;
        Relationships: [];
      };
      outreach_drafts: {
        Row: {
          id: string;
          vendor_shortlist_id: string;
          draft_text: string;
          status: OutreachStatus;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vendor_shortlist_id: string;
          draft_text: string;
          status?: OutreachStatus;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          vendor_shortlist_id: string;
          draft_text: string;
          status: OutreachStatus;
          updated_at: string;
        }>;
        Relationships: [];
      };
      budget_items: {
        Row: {
          id: string;
          ceremony_id: string;
          category_id: string;
          estimated_cost: number | null;
          actual_cost: number | null;
          vendor_shortlist_id: string | null;
        };
        Insert: {
          id?: string;
          ceremony_id: string;
          category_id: string;
          estimated_cost?: number | null;
          actual_cost?: number | null;
          vendor_shortlist_id?: string | null;
        };
        Update: Partial<{
          id: string;
          ceremony_id: string;
          category_id: string;
          estimated_cost: number | null;
          actual_cost: number | null;
          vendor_shortlist_id: string | null;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
