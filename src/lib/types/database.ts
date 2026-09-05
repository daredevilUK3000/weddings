export type Vibe =
  | "spiritual"
  | "glam"
  | "minimalist"
  | "gothic_romantic"
  | "funny";

export type CeremonyStatus =
  | "planning"
  | "confirmed"
  | "preparing"
  | "ready"
  | "wedding_day"
  | "ceremony_active"
  | "completed";

export type OutreachStatus = "not_sent" | "sent" | "replied" | "booked";

export type TimelineEventStatus = "upcoming" | "ready" | "active" | "delayed" | "completed" | "skipped";

export type VendorBookingStatus =
  | "not_contacted"
  | "contacted"
  | "responded"
  | "booked"
  | "confirmed"
  | "arrived"
  | "completed";

export type WitnessAttendanceType =
  | "in_person"
  | "online"
  | "remote_contribution"
  | "witnessing_afterward";

export type WitnessRsvpStatus = "accepted" | "declined";

export type SignatureType = "drawn" | "typed";

export type NotificationRecipientType = "user" | "witness";

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
          start_time: string | null;
          wedding_day_started_at: string | null;
          ceremony_started_at: string | null;
          livestream_url: string | null;
          share_vows: boolean;
          share_ceremony_story: boolean;
          share_programme: boolean;
          share_certificate: boolean;
          share_photographs: boolean;
          share_livestream: boolean;
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
          start_time?: string | null;
          wedding_day_started_at?: string | null;
          ceremony_started_at?: string | null;
          livestream_url?: string | null;
          share_vows?: boolean;
          share_ceremony_story?: boolean;
          share_programme?: boolean;
          share_certificate?: boolean;
          share_photographs?: boolean;
          share_livestream?: boolean;
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
          start_time: string | null;
          wedding_day_started_at: string | null;
          ceremony_started_at: string | null;
          livestream_url: string | null;
          share_vows: boolean;
          share_ceremony_story: boolean;
          share_programme: boolean;
          share_certificate: boolean;
          share_photographs: boolean;
          share_livestream: boolean;
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
          event_status: TimelineEventStatus;
          actual_start_at: string | null;
          actual_end_at: string | null;
        };
        Insert: {
          id?: string;
          ceremony_id: string;
          moment_name: string;
          time?: string | null;
          notes?: string | null;
          order_index?: number;
          event_status?: TimelineEventStatus;
          actual_start_at?: string | null;
          actual_end_at?: string | null;
        };
        Update: Partial<{
          id: string;
          ceremony_id: string;
          moment_name: string;
          time: string | null;
          notes: string | null;
          order_index: number;
          event_status: TimelineEventStatus;
          actual_start_at: string | null;
          actual_end_at: string | null;
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
          booking_status: VendorBookingStatus;
          contact_person: string | null;
          contact_phone: string | null;
          booking_reference: string | null;
          arrival_time: string | null;
          service_start_time: string | null;
          service_end_time: string | null;
          amount_outstanding: number | null;
          vendor_notes: string | null;
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
          booking_status?: VendorBookingStatus;
          contact_person?: string | null;
          contact_phone?: string | null;
          booking_reference?: string | null;
          arrival_time?: string | null;
          service_start_time?: string | null;
          service_end_time?: string | null;
          amount_outstanding?: number | null;
          vendor_notes?: string | null;
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
          booking_status: VendorBookingStatus;
          contact_person: string | null;
          contact_phone: string | null;
          booking_reference: string | null;
          arrival_time: string | null;
          service_start_time: string | null;
          service_end_time: string | null;
          amount_outstanding: number | null;
          vendor_notes: string | null;
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
      witnesses: {
        Row: {
          id: string;
          ceremony_id: string;
          name: string;
          email: string;
          relationship: string | null;
          attendance_type: WitnessAttendanceType;
          can_sign_certificate: boolean;
          invite_token: string;
          invited_at: string | null;
          opened_at: string | null;
          rsvp_status: WitnessRsvpStatus | null;
          rsvp_at: string | null;
          checked_in_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ceremony_id: string;
          name: string;
          email: string;
          relationship?: string | null;
          attendance_type: WitnessAttendanceType;
          can_sign_certificate?: boolean;
          invite_token?: string;
          invited_at?: string | null;
          opened_at?: string | null;
          rsvp_status?: WitnessRsvpStatus | null;
          rsvp_at?: string | null;
          checked_in_at?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          ceremony_id: string;
          name: string;
          email: string;
          relationship: string | null;
          attendance_type: WitnessAttendanceType;
          can_sign_certificate: boolean;
          invite_token: string;
          invited_at: string | null;
          opened_at: string | null;
          rsvp_status: WitnessRsvpStatus | null;
          rsvp_at: string | null;
          checked_in_at: string | null;
          created_at: string;
        }>;
        Relationships: [];
      };
      witness_contributions: {
        Row: {
          id: string;
          witness_id: string;
          body: string;
          include_in_ceremony: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          witness_id: string;
          body: string;
          include_in_ceremony?: boolean;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          witness_id: string;
          body: string;
          include_in_ceremony: boolean;
          created_at: string;
        }>;
        Relationships: [];
      };
      witness_signatures: {
        Row: {
          id: string;
          witness_id: string;
          signature_type: SignatureType;
          signature_data: string;
          consent: boolean;
          certificate_version: number;
          signed_at: string;
        };
        Insert: {
          id?: string;
          witness_id: string;
          signature_type: SignatureType;
          signature_data: string;
          consent?: boolean;
          certificate_version?: number;
          signed_at?: string;
        };
        Update: Partial<{
          id: string;
          witness_id: string;
          signature_type: SignatureType;
          signature_data: string;
          consent: boolean;
          certificate_version: number;
          signed_at: string;
        }>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          ceremony_id: string;
          recipient_type: NotificationRecipientType;
          recipient_id: string | null;
          notification_type: string;
          sent_at: string;
        };
        Insert: {
          id?: string;
          ceremony_id: string;
          recipient_type: NotificationRecipientType;
          recipient_id?: string | null;
          notification_type: string;
          sent_at?: string;
        };
        Update: Partial<{
          id: string;
          ceremony_id: string;
          recipient_type: NotificationRecipientType;
          recipient_id: string | null;
          notification_type: string;
          sent_at: string;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
