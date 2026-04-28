// Auto-generated types for Supabase.
// To regenerate: npx supabase gen types typescript --linked > apps/web/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MeetingStatus =
  | 'pending'
  | 'queued'
  | 'transcribing'
  | 'summarizing'
  | 'completed'
  | 'failed';

export type ActionItemStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type ActionItemPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SubscriptionPlan = 'free' | 'pro' | 'team';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired';
export type OrgMemberRole = 'owner' | 'admin' | 'member';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      org_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: OrgMemberRole;
          invited_at: string;
          joined_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role?: OrgMemberRole;
          invited_at?: string;
          joined_at?: string | null;
        };
        Update: {
          role?: OrgMemberRole;
          joined_at?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string | null;
          org_id: string | null;
          lemon_squeezy_id: string | null;
          lemon_subscription_id: string | null;
          plan: SubscriptionPlan;
          status: SubscriptionStatus;
          currency: string;
          billing_interval: string;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          org_id?: string | null;
          lemon_squeezy_id?: string | null;
          lemon_subscription_id?: string | null;
          plan: SubscriptionPlan;
          status: SubscriptionStatus;
          currency?: string;
          billing_interval?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
        };
        Update: {
          plan?: SubscriptionPlan;
          status?: SubscriptionStatus;
          currency?: string;
          billing_interval?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      meetings: {
        Row: {
          id: string;
          user_id: string;
          org_id: string | null;
          title: string;
          description: string | null;
          language: string;
          audio_file_path: string | null;
          audio_file_size: number | null;
          audio_duration: number | null;
          status: MeetingStatus;
          job_id: string | null;
          error_message: string | null;
          transcript: string | null;
          summary: string | null;
          key_decisions: Json | null;
          meeting_date: string;
          participants: Json | null;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          org_id?: string | null;
          title: string;
          description?: string | null;
          language?: string;
          audio_file_path?: string | null;
          audio_file_size?: number | null;
          audio_duration?: number | null;
          status?: MeetingStatus;
          job_id?: string | null;
          error_message?: string | null;
          transcript?: string | null;
          summary?: string | null;
          key_decisions?: Json | null;
          meeting_date?: string;
          participants?: Json | null;
          tags?: string[] | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          language?: string;
          audio_file_path?: string | null;
          audio_file_size?: number | null;
          audio_duration?: number | null;
          status?: MeetingStatus;
          job_id?: string | null;
          error_message?: string | null;
          transcript?: string | null;
          summary?: string | null;
          key_decisions?: Json | null;
          meeting_date?: string;
          participants?: Json | null;
          tags?: string[] | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      action_items: {
        Row: {
          id: string;
          meeting_id: string;
          user_id: string;
          title: string;
          description: string | null;
          assignee_name: string | null;
          assignee_email: string | null;
          assignee_id: string | null;
          status: ActionItemStatus;
          priority: ActionItemPriority;
          due_date: string | null;
          completed_at: string | null;
          ai_extracted: boolean;
          confidence: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          user_id: string;
          title: string;
          description?: string | null;
          assignee_name?: string | null;
          assignee_email?: string | null;
          assignee_id?: string | null;
          status?: ActionItemStatus;
          priority?: ActionItemPriority;
          due_date?: string | null;
          completed_at?: string | null;
          ai_extracted?: boolean;
          confidence?: number | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          assignee_name?: string | null;
          assignee_email?: string | null;
          assignee_id?: string | null;
          status?: ActionItemStatus;
          priority?: ActionItemPriority;
          due_date?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_logs: {
        Row: {
          id: string;
          meeting_id: string;
          user_id: string;
          recipients: string[] | null;
          subject: string | null;
          resend_id: string | null;
          status: string;
          sent_at: string | null;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          user_id: string;
          recipients?: string[] | null;
          subject?: string | null;
          resend_id?: string | null;
          status?: string;
          sent_at?: string | null;
          error?: string | null;
        };
        Update: {
          resend_id?: string | null;
          status?: string;
          sent_at?: string | null;
          error?: string | null;
        };
        Relationships: [];
      };
      usage_logs: {
        Row: {
          id: string;
          user_id: string;
          org_id: string | null;
          action: string;
          period_year: number;
          period_month: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          org_id?: string | null;
          action: string;
          period_year: number;
          period_month: number;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_monthly_usage: {
        Args: { p_user_id: string };
        Returns: number;
      };
      get_user_plan: {
        Args: { p_user_id: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience row types
export type Profile      = Database['public']['Tables']['profiles']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrgMember    = Database['public']['Tables']['org_members']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type Meeting      = Database['public']['Tables']['meetings']['Row'];
export type ActionItem   = Database['public']['Tables']['action_items']['Row'];
export type EmailLog     = Database['public']['Tables']['email_logs']['Row'];
export type UsageLog     = Database['public']['Tables']['usage_logs']['Row'];
