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
      asset_mentions: {
        Row: {
          article_id: string
          asset_id: string
          context: string | null
          created_at: string
          id: string
          mention_count: number | null
        }
        Insert: {
          article_id: string
          asset_id: string
          context?: string | null
          created_at?: string
          id?: string
          mention_count?: number | null
        }
        Update: {
          article_id?: string
          asset_id?: string
          context?: string | null
          created_at?: string
          id?: string
          mention_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_mentions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_mentions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_type: string
          created_at: string
          id: string
          influence_score: number | null
          market_cap: number | null
          name: string
          sector: string | null
          symbol: string
        }
        Insert: {
          asset_type?: string
          created_at?: string
          id?: string
          influence_score?: number | null
          market_cap?: number | null
          name: string
          sector?: string | null
          symbol: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          id?: string
          influence_score?: number | null
          market_cap?: number | null
          name?: string
          sector?: string | null
          symbol?: string
        }
        Relationships: []
      }
      influence_logs: {
        Row: {
          id: string
          influence_score: number
          logged_at: string
          person_id: string
        }
        Insert: {
          id?: string
          influence_score: number
          logged_at?: string
          person_id: string
        }
        Update: {
          id?: string
          influence_score?: number
          logged_at?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "influence_logs_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          content: string | null
          crawled_at: string
          id: string
          published_at: string | null
          sentiment: string | null
          sentiment_score: number | null
          source_name: string | null
          source_url: string
          summary: string | null
          title: string
        }
        Insert: {
          content?: string | null
          crawled_at?: string
          id?: string
          published_at?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          source_name?: string | null
          source_url: string
          summary?: string | null
          title: string
        }
        Update: {
          content?: string | null
          crawled_at?: string
          id?: string
          published_at?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          source_name?: string | null
          source_url?: string
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          id: string
          industry: string
          influence_score: number | null
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          id?: string
          industry: string
          influence_score?: number | null
          name: string
          role: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          id?: string
          industry?: string
          influence_score?: number | null
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      person_asset_relationships: {
        Row: {
          asset_id: string
          co_mention_count: number | null
          correlation_score: number | null
          id: string
          influence_strength: number | null
          last_co_mention_at: string | null
          person_id: string
          updated_at: string
        }
        Insert: {
          asset_id: string
          co_mention_count?: number | null
          correlation_score?: number | null
          id?: string
          influence_strength?: number | null
          last_co_mention_at?: string | null
          person_id: string
          updated_at?: string
        }
        Update: {
          asset_id?: string
          co_mention_count?: number | null
          correlation_score?: number | null
          id?: string
          influence_strength?: number | null
          last_co_mention_at?: string | null
          person_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_asset_relationships_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_asset_relationships_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      person_mentions: {
        Row: {
          article_id: string
          context: string | null
          created_at: string
          id: string
          mention_count: number | null
          person_id: string
        }
        Insert: {
          article_id: string
          context?: string | null
          created_at?: string
          id?: string
          mention_count?: number | null
          person_id: string
        }
        Update: {
          article_id?: string
          context?: string | null
          created_at?: string
          id?: string
          mention_count?: number | null
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_mentions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_mentions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
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
    Enums: {},
  },
} as const
