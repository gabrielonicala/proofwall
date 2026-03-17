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
      collection_forms: {
        Row: {
          accent_color: string | null
          created_at: string
          fields: Json
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          project_id: string
          redirect_url: string | null
          thank_you_message: string | null
          theme: string
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          fields?: Json
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          project_id: string
          redirect_url?: string | null
          thank_you_message?: string | null
          theme?: string
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          fields?: Json
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          project_id?: string
          redirect_url?: string | null
          thank_you_message?: string | null
          theme?: string
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_forms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_by: string
          id: string
          logo_url: string | null
          name: string
          plan: Database["public"]["Enums"]["plan"]
          slug: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          logo_url?: string | null
          name: string
          plan?: Database["public"]["Enums"]["plan"]
          slug?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          logo_url?: string | null
          name?: string
          plan?: Database["public"]["Enums"]["plan"]
          slug?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          interval: string
          price_id: string
          project_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          interval: string
          price_id: string
          project_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          interval?: string
          price_id?: string
          project_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          project_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          project_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonial_tags: {
        Row: {
          tag_id: string
          testimonial_id: string
        }
        Insert: {
          tag_id: string
          testimonial_id: string
        }
        Update: {
          tag_id?: string
          testimonial_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonial_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonial_tags_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "testimonials"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          author_company: string | null
          author_name: string
          author_photo: string | null
          author_title: string | null
          created_at: string
          id: string
          project_id: string
          rating: number | null
          source: Database["public"]["Enums"]["testimonial_source"]
          source_url: string | null
          status: Database["public"]["Enums"]["testimonial_status"]
          text: string
          updated_at: string
        }
        Insert: {
          author_company?: string | null
          author_name: string
          author_photo?: string | null
          author_title?: string | null
          created_at?: string
          id?: string
          project_id: string
          rating?: number | null
          source?: Database["public"]["Enums"]["testimonial_source"]
          source_url?: string | null
          status?: Database["public"]["Enums"]["testimonial_status"]
          text: string
          updated_at?: string
        }
        Update: {
          author_company?: string | null
          author_name?: string
          author_photo?: string | null
          author_title?: string | null
          created_at?: string
          id?: string
          project_id?: string
          rating?: number | null
          source?: Database["public"]["Enums"]["testimonial_source"]
          source_url?: string | null
          status?: Database["public"]["Enums"]["testimonial_status"]
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      wall_views: {
        Row: {
          country: string | null
          id: string
          referrer: string | null
          viewed_at: string
          wall_id: string
        }
        Insert: {
          country?: string | null
          id?: string
          referrer?: string | null
          viewed_at?: string
          wall_id: string
        }
        Update: {
          country?: string | null
          id?: string
          referrer?: string | null
          viewed_at?: string
          wall_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wall_views_wall_id_fkey"
            columns: ["wall_id"]
            isOneToOne: false
            referencedRelation: "walls"
            referencedColumns: ["id"]
          },
        ]
      }
      walls: {
        Row: {
          config: Json
          created_at: string
          excluded_ids: string[] | null
          id: string
          is_active: boolean
          max_testimonials: number | null
          name: string
          project_id: string
          style: Database["public"]["Enums"]["wall_style"]
          tag_filter: string[] | null
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          excluded_ids?: string[] | null
          id?: string
          is_active?: boolean
          max_testimonials?: number | null
          name: string
          project_id: string
          style?: Database["public"]["Enums"]["wall_style"]
          tag_filter?: string[] | null
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          excluded_ids?: string[] | null
          id?: string
          is_active?: boolean
          max_testimonials?: number | null
          name?: string
          project_id?: string
          style?: Database["public"]["Enums"]["wall_style"]
          tag_filter?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "walls_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_project_role: {
        Args: {
          _project_id: string
          _role: Database["public"]["Enums"]["project_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_project_member: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      plan: "free" | "pro" | "business"
      project_role: "owner" | "admin" | "member"
      testimonial_source: "manual" | "form" | "twitter" | "csv" | "url"
      testimonial_status: "pending" | "approved" | "featured" | "archived"
      wall_style:
        | "cards-grid"
        | "carousel"
        | "ticker-tape"
        | "fade-rotator"
        | "minimal-list"
        | "masonry"
        | "marquee"
        | "spotlight-stack"
        | "orbit"
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
      plan: ["free", "pro", "business"],
      project_role: ["owner", "admin", "member"],
      testimonial_source: ["manual", "form", "twitter", "csv", "url"],
      testimonial_status: ["pending", "approved", "featured", "archived"],
      wall_style: [
        "cards-grid",
        "carousel",
        "ticker-tape",
        "fade-rotator",
        "minimal-list",
        "masonry",
        "marquee",
        "spotlight-stack",
        "orbit",
      ],
    },
  },
} as const
