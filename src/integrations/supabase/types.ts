export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string;
          created_at: string;
          full_name: string;
          governorate: string;
          id: string;
          notes: string | null;
          phone: string;
          street: string;
          user_id: string;
        };
        Insert: {
          city: string;
          created_at?: string;
          full_name: string;
          governorate: string;
          id?: string;
          notes?: string | null;
          phone: string;
          street: string;
          user_id: string;
        };
        Update: {
          city?: string;
          created_at?: string;
          full_name?: string;
          governorate?: string;
          id?: string;
          notes?: string | null;
          phone?: string;
          street?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "addresses_governorate_fkey";
            columns: ["governorate"];
            isOneToOne: false;
            referencedRelation: "shipping_rates";
            referencedColumns: ["governorate"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          name_ar: string;
          name_en: string;
          slug: string;
          sort: number;
        };
        Insert: {
          id?: string;
          name_ar: string;
          name_en: string;
          slug: string;
          sort?: number;
        };
        Update: {
          id?: string;
          name_ar?: string;
          name_en?: string;
          slug?: string;
          sort?: number;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          engraving_price: number;
          engraving_text: string | null;
          id: string;
          image: string | null;
          line_total: number;
          name_ar: string;
          name_en: string;
          order_id: string;
          product_id: string | null;
          quantity: number;
          unit_price: number;
          variant_ar: string | null;
          variant_en: string | null;
          variant_id: string | null;
        };
        Insert: {
          engraving_price?: number;
          engraving_text?: string | null;
          id?: string;
          image?: string | null;
          line_total: number;
          name_ar: string;
          name_en: string;
          order_id: string;
          product_id?: string | null;
          quantity: number;
          unit_price: number;
          variant_ar?: string | null;
          variant_en?: string | null;
          variant_id?: string | null;
        };
        Update: {
          engraving_price?: number;
          engraving_text?: string | null;
          id?: string;
          image?: string | null;
          line_total?: number;
          name_ar?: string;
          name_en?: string;
          order_id?: string;
          product_id?: string | null;
          quantity?: number;
          unit_price?: number;
          variant_ar?: string | null;
          variant_en?: string | null;
          variant_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      order_status_events: {
        Row: {
          created_at: string;
          id: string;
          order_id: string;
          status: Database["public"]["Enums"]["order_status"];
        };
        Insert: {
          created_at?: string;
          id?: string;
          order_id: string;
          status: Database["public"]["Enums"]["order_status"];
        };
        Update: {
          created_at?: string;
          id?: string;
          order_id?: string;
          status?: Database["public"]["Enums"]["order_status"];
        };
        Relationships: [
          {
            foreignKeyName: "order_status_events_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          address_notes: string | null;
          city: string;
          contact_email: string | null;
          contact_name: string;
          contact_phone: string;
          created_at: string;
          extras_total: number;
          gift_message: string | null;
          gift_wrap: boolean;
          governorate: string;
          greeting_card: boolean;
          id: string;
          idempotency_key: string;
          order_number: number;
          payment_method: string;
          payment_status: string;
          shipping_fee: number;
          status: Database["public"]["Enums"]["order_status"];
          street: string;
          subtotal: number;
          total: number;
          user_id: string;
        };
        Insert: {
          address_notes?: string | null;
          city: string;
          contact_email?: string | null;
          contact_name: string;
          contact_phone: string;
          created_at?: string;
          extras_total?: number;
          gift_message?: string | null;
          gift_wrap?: boolean;
          governorate: string;
          greeting_card?: boolean;
          id?: string;
          idempotency_key: string;
          order_number?: number;
          payment_method?: string;
          payment_status?: string;
          shipping_fee: number;
          status?: Database["public"]["Enums"]["order_status"];
          street: string;
          subtotal: number;
          total: number;
          user_id: string;
        };
        Update: {
          address_notes?: string | null;
          city?: string;
          contact_email?: string | null;
          contact_name?: string;
          contact_phone?: string;
          created_at?: string;
          extras_total?: number;
          gift_message?: string | null;
          gift_wrap?: boolean;
          governorate?: string;
          greeting_card?: boolean;
          id?: string;
          idempotency_key?: string;
          order_number?: number;
          payment_method?: string;
          payment_status?: string;
          shipping_fee?: number;
          status?: Database["public"]["Enums"]["order_status"];
          street?: string;
          subtotal?: number;
          total?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          name_ar: string;
          name_en: string;
          price_delta: number;
          product_id: string;
          sort: number;
          stock: number;
        };
        Insert: {
          id?: string;
          name_ar: string;
          name_en: string;
          price_delta?: number;
          product_id: string;
          sort?: number;
          stock?: number;
        };
        Update: {
          id?: string;
          name_ar?: string;
          name_en?: string;
          price_delta?: number;
          product_id?: string;
          sort?: number;
          stock?: number;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          active: boolean;
          allow_engraving: boolean;
          bestseller: boolean;
          category_id: string | null;
          compare_at_price: number | null;
          created_at: string;
          description_ar: string;
          description_en: string;
          engraving_price: number;
          featured: boolean;
          id: string;
          images: string[];
          name_ar: string;
          name_en: string;
          price: number;
          sales_count: number;
          slug: string;
          stock: number;
        };
        Insert: {
          active?: boolean;
          allow_engraving?: boolean;
          bestseller?: boolean;
          category_id?: string | null;
          compare_at_price?: number | null;
          created_at?: string;
          description_ar?: string;
          description_en?: string;
          engraving_price?: number;
          featured?: boolean;
          id?: string;
          images?: string[];
          name_ar: string;
          name_en: string;
          price: number;
          sales_count?: number;
          slug: string;
          stock?: number;
        };
        Update: {
          active?: boolean;
          allow_engraving?: boolean;
          bestseller?: boolean;
          category_id?: string | null;
          compare_at_price?: number | null;
          created_at?: string;
          description_ar?: string;
          description_en?: string;
          engraving_price?: number;
          featured?: boolean;
          id?: string;
          images?: string[];
          name_ar?: string;
          name_en?: string;
          price?: number;
          sales_count?: number;
          slug?: string;
          stock?: number;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
        };
        Relationships: [];
      };
      shipping_rates: {
        Row: {
          eta_days: string;
          fee: number;
          governorate: string;
          name_ar: string;
        };
        Insert: {
          eta_days?: string;
          fee: number;
          governorate: string;
          name_ar: string;
        };
        Update: {
          eta_days?: string;
          fee?: number;
          governorate?: string;
          name_ar?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      wishlists: {
        Row: {
          created_at: string;
          product_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          product_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          product_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      place_order: { Args: { payload: Json }; Returns: Json };
    };
    Enums: {
      app_role: "admin" | "user";
      order_status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      order_status: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
    },
  },
} as const;
