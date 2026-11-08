export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      entitlements: {
        Row: {
          current_period_end: string | null;
          source: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          tier: string;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          current_period_end?: string | null;
          source?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          tier?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          current_period_end?: string | null;
          source?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          tier?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      plan_items: {
        Row: {
          category: string;
          distance_miles: number | null;
          fit_reason: string | null;
          fit_score: number | null;
          id: string;
          image_url: string | null;
          lat: number | null;
          lng: number | null;
          plan_id: string;
          price_estimated: boolean;
          price_known: boolean;
          price_max_cents: number | null;
          price_min_cents: number | null;
          rank: number;
          raw: Json | null;
          source: string;
          source_id: string | null;
          starts_at: string | null;
          title: string;
          url: string | null;
          venue_name: string | null;
          verified: boolean;
        };
        ComputedFields: never;
        Insert: {
          category: string;
          distance_miles?: number | null;
          fit_reason?: string | null;
          fit_score?: number | null;
          id?: string;
          image_url?: string | null;
          lat?: number | null;
          lng?: number | null;
          plan_id: string;
          price_estimated?: boolean;
          price_known?: boolean;
          price_max_cents?: number | null;
          price_min_cents?: number | null;
          rank: number;
          raw?: Json | null;
          source: string;
          source_id?: string | null;
          starts_at?: string | null;
          title: string;
          url?: string | null;
          venue_name?: string | null;
          verified?: boolean;
        };
        Update: {
          category?: string;
          distance_miles?: number | null;
          fit_reason?: string | null;
          fit_score?: number | null;
          id?: string;
          image_url?: string | null;
          lat?: number | null;
          lng?: number | null;
          plan_id?: string;
          price_estimated?: boolean;
          price_known?: boolean;
          price_max_cents?: number | null;
          price_min_cents?: number | null;
          rank?: number;
          raw?: Json | null;
          source?: string;
          source_id?: string | null;
          starts_at?: string | null;
          title?: string;
          url?: string | null;
          venue_name?: string | null;
          verified?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "plan_items_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          anon_id: string | null;
          created_at: string;
          date_end: string;
          date_start: string;
          id: string;
          input: NonNullable<Json>;
          meta: NonNullable<Json>;
          resolved_location: Json | null;
          status: string;
          user_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          anon_id?: string | null;
          created_at?: string;
          date_end: string;
          date_start: string;
          id?: string;
          input: NonNullable<Json>;
          meta?: NonNullable<Json>;
          resolved_location?: Json | null;
          status?: string;
          user_id?: string | null;
        };
        Update: {
          anon_id?: string | null;
          created_at?: string;
          date_end?: string;
          date_start?: string;
          id?: string;
          input?: NonNullable<Json>;
          meta?: NonNullable<Json>;
          resolved_location?: Json | null;
          status?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      preferences: {
        Row: {
          budget_max_cents: number | null;
          budget_min_cents: number;
          event_types: string[];
          group_size: number;
          interests: string[];
          interests_freeform: string | null;
          lat: number | null;
          lng: number | null;
          location_label: string | null;
          radius_miles: number;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          budget_max_cents?: number | null;
          budget_min_cents?: number;
          event_types?: string[];
          group_size?: number;
          interests?: string[];
          interests_freeform?: string | null;
          lat?: number | null;
          lng?: number | null;
          location_label?: string | null;
          radius_miles?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          budget_max_cents?: number | null;
          budget_min_cents?: number;
          event_types?: string[];
          group_size?: number;
          interests?: string[];
          interests_freeform?: string | null;
          lat?: number | null;
          lng?: number | null;
          location_label?: string | null;
          radius_miles?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      provider_cache: {
        Row: {
          expires_at: string;
          key: string;
          payload: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          expires_at: string;
          key: string;
          payload: NonNullable<Json>;
        };
        Update: {
          expires_at?: string;
          key?: string;
          payload?: NonNullable<Json>;
        };
        Relationships: [];
      };
      saved_items: {
        Row: {
          created_at: string;
          plan_item_id: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          plan_item_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          plan_item_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_items_plan_item_id_fkey";
            columns: ["plan_item_id"];
            isOneToOne: false;
            referencedRelation: "plan_items";
            referencedColumns: ["id"];
          },
        ];
      };
      usage_counters: {
        Row: {
          period: string;
          plans_generated: number;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          period: string;
          plans_generated?: number;
          user_id: string;
        };
        Update: {
          period?: string;
          plans_generated?: number;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
