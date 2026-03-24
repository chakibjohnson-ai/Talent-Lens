/**
 * database.types.ts — TalentLens backend
 *
 * Handmatig bijgehouden Supabase Database-type definities voor de backend server.
 * Conform de GenericSchema interface van @supabase/supabase-js (v2+):
 *   - Elke tabel vereist Relationships: GenericRelationship[]
 *   - Views vereist Relationships
 *   - Functions: Args + Returns
 *
 * Gebruik:
 *   import type { Database, CvAnalysisJobRow, WebhookPayload } from './types/database.types';
 *   const supabaseAdmin = createClient<Database>(url, key);
 */

// ─── Gedeelde domeintypen ─────────────────────────────────────────────────────

export type WorkspaceRole      = 'member' | 'admin' | 'platform_admin';
export type JobStatus          = 'pending' | 'processing' | 'completed' | 'error';
export type SubscriptionStatus = 'free' | 'active' | 'trialing' | 'canceled' | 'past_due';
export type AnalysisType       = 'linkedin' | 'indeed' | 'cv' | 'vacature';
export type LocationType       = 'city' | 'region' | 'remote' | 'unknown';

export interface CompanyMetadata {
  name:      string | null;
  logo_url:  string | null;
  industry:  string | null;
}

export interface LocationStructured {
  city:    string | null;
  region:  string | null;
  country: string | null;
  type:    LocationType;
}

export interface CvAnalysisResult {
  korte_samenvatting:  string | null;
  werkervaring_jaren:  number | null;
  opleidingen:         string[];
  talen:               string[];
  hard_skills:         string[];
  soft_skills:         string[];
}

export interface ExtractedSkills {
  hard_skills:    string[];
  soft_skills:    string[];
  certifications: string[];
  languages:      string[];
  raw_keywords?:  string[];
}

// ─── Webhook-payload types ────────────────────────────────────────────────────

export interface CvJobWebhookRecord {
  id:               string;
  user_id:          string;
  workspace_id:     string | null;
  file_path:        string;
  file_name:        string;
  status:           string;
  result_data:      unknown | null;
  error_message:    string | null;
  anonymized_text:  string | null;
  match_score:      number | null;
  extracted_skills: unknown | null;
  created_at:       string;
  updated_at:       string;
}

export interface WebhookPayload {
  type:       'INSERT' | 'UPDATE' | 'DELETE';
  table:      string;
  schema:     string;
  record:     CvJobWebhookRecord;
  old_record: null | Record<string, unknown>;
}

// ─── Database-schema ──────────────────────────────────────────────────────────
// Conform GenericSchema: elke Table heeft Relationships: []

export interface Database {
  public: {
    Tables: {

      workspaces: {
        Row: {
          id:         string;
          name:       string;
          created_at: string;
        };
        Insert: {
          id?:         string;
          name:        string;
          created_at?: string;
        };
        Update: {
          id?:         string;
          name?:       string;
          created_at?: string;
        };
        Relationships: [];
      };

      workspace_members: {
        Row: {
          workspace_id: string;
          user_id:      string;
          role:         WorkspaceRole;
          joined_at:    string;
        };
        Insert: {
          workspace_id: string;
          user_id:      string;
          role?:        WorkspaceRole;
          joined_at?:   string;
        };
        Update: {
          workspace_id?: string;
          user_id?:      string;
          role?:         WorkspaceRole;
          joined_at?:    string;
        };
        Relationships: [
          {
            foreignKeyName: 'workspace_members_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };

      cv_analysis_jobs: {
        Row: {
          id:               string;
          user_id:          string;
          workspace_id:     string | null;
          file_path:        string;
          file_name:        string;
          status:           JobStatus;
          result_data:      CvAnalysisResult | null;
          error_message:    string | null;
          anonymized_text:  string | null;
          match_score:      number | null;
          extracted_skills: ExtractedSkills | null;
          created_at:       string;
          updated_at:       string;
        };
        Insert: {
          id?:               string;
          user_id:           string;
          workspace_id?:     string | null;
          file_path:         string;
          file_name:         string;
          status?:           JobStatus;
          result_data?:      CvAnalysisResult | null;
          error_message?:    string | null;
          anonymized_text?:  string | null;
          match_score?:      number | null;
          extracted_skills?: ExtractedSkills | null;
          created_at?:       string;
          updated_at?:       string;
        };
        Update: {
          id?:               string;
          user_id?:          string;
          workspace_id?:     string | null;
          file_path?:        string;
          file_name?:        string;
          status?:           JobStatus;
          result_data?:      CvAnalysisResult | null;
          error_message?:    string | null;
          anonymized_text?:  string | null;
          match_score?:      number | null;
          extracted_skills?: ExtractedSkills | null;
          created_at?:       string;
          updated_at?:       string;
        };
        Relationships: [
          {
            foreignKeyName: 'cv_analysis_jobs_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };

      user_profiles: {
        Row: {
          id:                  string;
          email:               string | null;
          full_name:           string | null;
          subscription_status: SubscriptionStatus | null;
          stripe_customer_id:  string | null;
          is_tester:           boolean;
          org_id:              string | null;
          created_at:          string;
          updated_at:          string;
        };
        Insert: {
          id:                   string;
          email?:               string | null;
          full_name?:           string | null;
          subscription_status?: SubscriptionStatus | null;
          stripe_customer_id?:  string | null;
          is_tester?:           boolean;
          org_id?:              string | null;
          created_at?:          string;
          updated_at?:          string;
        };
        Update: {
          id?:                  string;
          email?:               string | null;
          full_name?:           string | null;
          subscription_status?: SubscriptionStatus | null;
          stripe_customer_id?:  string | null;
          is_tester?:           boolean;
          org_id?:              string | null;
          created_at?:          string;
          updated_at?:          string;
        };
        Relationships: [];
      };

      organizations: {
        Row: {
          id:         string;
          name:       string;
          domain:     string;        // NOT NULL UNIQUE in DB
          max_seats:  number | null;
          is_active:  boolean;       // NOT NULL DEFAULT true
          created_at: string;
        };
        Insert: {
          id?:         string;
          name:        string;
          domain:      string;
          max_seats?:  number | null;
          is_active?:  boolean;
          created_at?: string;
        };
        Update: {
          id?:         string;
          name?:       string;
          domain?:     string;
          max_seats?:  number | null;
          is_active?:  boolean;
          created_at?: string;
        };
        Relationships: [];
      };

      // Kolommen conform SQL schema: title + boolean_string + label_id
      saved_booleans: {
        Row: {
          id:              string;
          user_id:         string;
          team_id:         string | null;
          organization_id: string | null;
          label_id:        string | null;  // legacy team-label
          title:           string | null;  // was foutief 'name'
          boolean_string:  string | null;  // was foutief 'content'
          created_at:      string;
        };
        Insert: {
          id?:              string;
          user_id:          string;
          team_id?:         string | null;
          organization_id?: string | null;
          label_id?:        string | null;
          title?:           string | null;
          boolean_string?:  string | null;
          created_at?:      string;
        };
        Update: {
          id?:              string;
          user_id?:         string;
          team_id?:         string | null;
          organization_id?: string | null;
          label_id?:        string | null;
          title?:           string | null;
          boolean_string?:  string | null;
          created_at?:      string;
        };
        Relationships: [];
      };

      candidates: {
        Row:    Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };

      // Kolom heet 'content' in de DB — conform alle SQL migraties
      daily_facts: {
        Row: {
          id:         number;
          content:    string;   // was foutief 'fact_text'
          category:   string | null;
          created_at: string;
        };
        Insert: {
          id?:         number;
          content:     string;
          category?:   string | null;
          created_at?: string;
        };
        Update: {
          id?:         number;
          content?:    string;
          category?:   string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      // ── analyses: opgeslagen profiel- en vacatureanalyses ──────────────────
      analyses: {
        Row: {
          id:                   string;
          created_at:           string;
          user_id:              string | null;
          type:                 AnalysisType;
          data:                 Record<string, unknown>;
          session_id:           string | null;
          is_locked:            boolean;
          source_url:           string | null;
          location:             string | null;
          company_metadata:     CompanyMetadata | null;
          location_structured:  LocationStructured | null;
        };
        Insert: {
          id?:                   string;
          created_at?:           string;
          user_id?:              string | null;
          type:                  AnalysisType;
          data:                  Record<string, unknown>;
          session_id?:           string | null;
          is_locked?:            boolean;
          source_url?:           string | null;
          location?:             string | null;
          company_metadata?:     CompanyMetadata | null;
          location_structured?:  LocationStructured | null;
        };
        Update: {
          id?:                   string;
          created_at?:           string;
          user_id?:              string | null;
          type?:                 AnalysisType;
          data?:                 Record<string, unknown>;
          session_id?:           string | null;
          is_locked?:            boolean;
          source_url?:           string | null;
          location?:             string | null;
          company_metadata?:     CompanyMetadata | null;
          location_structured?:  LocationStructured | null;
        };
        Relationships: [];
      };

      // ── search_profiles: opgeslagen profielzoekopdrachten (ProfileScout) ──
      search_profiles: {
        Row: {
          id:              string;
          user_id:         string;
          raw_query:       string;
          structured_data: Record<string, unknown>;
          created_at:      string;
        };
        Insert: {
          id?:              string;
          user_id:          string;
          raw_query:        string;
          structured_data?: Record<string, unknown>;
          created_at?:      string;
        };
        Update: {
          id?:              string;
          user_id?:         string;
          raw_query?:       string;
          structured_data?: Record<string, unknown>;
          created_at?:      string;
        };
        Relationships: [];
      };

      user_settings: {
        Row: {
          user_id:              string;
          writing_style_sample: string | null;
          created_at:           string;  // added by VERIFY_AND_FIX_ALL
          updated_at:           string;  // added by VERIFY_AND_FIX_ALL
        };
        Insert: {
          user_id:               string;
          writing_style_sample?: string | null;
          created_at?:           string;
          updated_at?:           string;
        };
        Update: {
          user_id?:              string;
          writing_style_sample?: string | null;
          created_at?:           string;
          updated_at?:           string;
        };
        Relationships: [];
      };
    };

    Views: Record<string, never>;

    Functions: {
      get_random_fact: {
        Args:    Record<string, never>;
        Returns: string;
      };
      get_org_candidates: {
        Args:    { p_org_id: string; p_limit?: number };
        Returns: unknown[];
      };
      has_active_subscription: {
        Args:    { user_id: string };
        Returns: boolean;
      };
      is_workspace_member: {
        Args:    { p_workspace_id: string };
        Returns: boolean;
      };
      is_workspace_admin: {
        Args:    { p_workspace_id: string };
        Returns: boolean;
      };
    };

    Enums: {
      workspace_role: WorkspaceRole;
    };
  };
}

// ─── Convenience-helpers ──────────────────────────────────────────────────────

type Tables = Database['public']['Tables'];

export type WorkspaceRow          = Tables['workspaces']['Row'];
export type WorkspaceMemberRow    = Tables['workspace_members']['Row'];
export type CvAnalysisJobRow      = Tables['cv_analysis_jobs']['Row'];
export type CvAnalysisJobInsert   = Tables['cv_analysis_jobs']['Insert'];
export type CvAnalysisJobUpdate   = Tables['cv_analysis_jobs']['Update'];
export type UserProfileRow        = Tables['user_profiles']['Row'];
export type OrganizationRow       = Tables['organizations']['Row'];
export type AnalysisRow           = Tables['analyses']['Row'];
export type AnalysisInsert        = Tables['analyses']['Insert'];
export type SearchProfileRow      = Tables['search_profiles']['Row'];
export type SearchProfileInsert   = Tables['search_profiles']['Insert'];
