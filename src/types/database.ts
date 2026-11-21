// Dibuat otomatis dari skema Supabase. Jangan diedit manual; buat ulang setelah ada migrasi baru.

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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_roles: {
        Row: {
          created_at: string
          name: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          name: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          name?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      checkout_attempts: {
        Row: {
          created_at: string
          id: number
          ip_hash: string
        }
        Insert: {
          created_at?: string
          id?: never
          ip_hash: string
        }
        Update: {
          created_at?: string
          id?: never
          ip_hash?: string
        }
        Relationships: []
      }
      lookup_attempts: {
        Row: {
          created_at: string
          id: number
          ip_hash: string
        }
        Insert: {
          created_at?: string
          id?: never
          ip_hash: string
        }
        Update: {
          created_at?: string
          id?: never
          ip_hash?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
          ship_weight_at_purchase_gram: number
        }
        Insert: {
          id?: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
          ship_weight_at_purchase_gram: number
        }
        Update: {
          id?: string
          order_id?: string
          price_at_purchase?: number
          product_id?: string
          quantity?: number
          ship_weight_at_purchase_gram?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_note: string | null
          address_text: string
          area_id: string
          arrived_at: string | null
          batch_id: string
          buyer_name: string
          buyer_phone: string
          cancel_note: string | null
          cancel_reason: string | null
          consent_at: string
          created_at: string
          delivered_at: string | null
          delivery_attempts: number
          delivery_fee: number
          expires_at: string
          id: string
          invoice_number: string
          lat: number
          lng: number
          order_status: string
          paid_at: string | null
          payment_status: string
          proof_photo_path: string | null
          recipient_name: string | null
          recipient_phone: string | null
          shipped_at: string | null
          snap_redirect_url: string | null
          snap_token: string | null
          status_token: string
          subtotal: number
          total_amount: number
          total_weight_gram: number
          updated_at: string
        }
        Insert: {
          address_note?: string | null
          address_text: string
          area_id: string
          arrived_at?: string | null
          batch_id: string
          buyer_name: string
          buyer_phone: string
          cancel_note?: string | null
          cancel_reason?: string | null
          consent_at: string
          created_at?: string
          delivered_at?: string | null
          delivery_attempts?: number
          delivery_fee: number
          expires_at: string
          id?: string
          invoice_number: string
          lat: number
          lng: number
          order_status?: string
          paid_at?: string | null
          payment_status?: string
          proof_photo_path?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          shipped_at?: string | null
          snap_redirect_url?: string | null
          snap_token?: string | null
          status_token?: string
          subtotal: number
          total_amount: number
          total_weight_gram: number
          updated_at?: string
        }
        Update: {
          address_note?: string | null
          address_text?: string
          area_id?: string
          arrived_at?: string | null
          batch_id?: string
          buyer_name?: string
          buyer_phone?: string
          cancel_note?: string | null
          cancel_reason?: string | null
          consent_at?: string
          created_at?: string
          delivered_at?: string | null
          delivery_attempts?: number
          delivery_fee?: number
          expires_at?: string
          id?: string
          invoice_number?: string
          lat?: number
          lng?: number
          order_status?: string
          paid_at?: string | null
          payment_status?: string
          proof_photo_path?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          shipped_at?: string | null
          snap_redirect_url?: string | null
          snap_token?: string | null
          status_token?: string
          subtotal?: number
          total_amount?: number
          total_weight_gram?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "service_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "po_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          fraud_status: string | null
          gross_amount: number
          id: string
          invoice_number: string
          order_id: string | null
          outcome: string | null
          payment_type: string | null
          raw_payload: Json
          received_at: string
          transaction_id: string
          transaction_status: string
          transaction_time: string | null
        }
        Insert: {
          fraud_status?: string | null
          gross_amount: number
          id?: string
          invoice_number: string
          order_id?: string | null
          outcome?: string | null
          payment_type?: string | null
          raw_payload: Json
          received_at?: string
          transaction_id: string
          transaction_status: string
          transaction_time?: string | null
        }
        Update: {
          fraud_status?: string | null
          gross_amount?: number
          id?: string
          invoice_number?: string
          order_id?: string | null
          outcome?: string | null
          payment_type?: string | null
          raw_payload?: Json
          received_at?: string
          transaction_id?: string
          transaction_status?: string
          transaction_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      po_batches: {
        Row: {
          cancel_reason: string | null
          capacity_gram: number
          change_reason: string | null
          close_order_at: string
          created_at: string
          created_by: string | null
          delivery_date: string
          id: string
          max_order_weight_gram: number
          min_orders: number
          min_weight_gram: number
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          cancel_reason?: string | null
          capacity_gram: number
          change_reason?: string | null
          close_order_at: string
          created_at?: string
          created_by?: string | null
          delivery_date: string
          id?: string
          max_order_weight_gram: number
          min_orders?: number
          min_weight_gram?: number
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          cancel_reason?: string | null
          capacity_gram?: number
          change_reason?: string | null
          close_order_at?: string
          created_at?: string
          created_by?: string | null
          delivery_date?: string
          id?: string
          max_order_weight_gram?: number
          min_orders?: number
          min_weight_gram?: number
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_path: string | null
          is_active: boolean
          name: string
          net_weight_gram: number | null
          price: number | null
          ship_weight_gram: number | null
          slug: string
          sort_order: number
          unit_type: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          name: string
          net_weight_gram?: number | null
          price?: number | null
          ship_weight_gram?: number | null
          slug: string
          sort_order?: number
          unit_type: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          name?: string
          net_weight_gram?: number | null
          price?: number | null
          ship_weight_gram?: number | null
          slug?: string
          sort_order?: number
          unit_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          processed_at: string | null
          processed_by: string | null
          proof_path: string | null
          reason: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          processed_at?: string | null
          processed_by?: string | null
          proof_path?: string | null
          reason: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          processed_at?: string | null
          processed_by?: string | null
          proof_path?: string | null
          reason?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_areas: {
        Row: {
          center_lat: number
          center_lng: number
          created_at: string
          delivery_fee: number | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          center_lat: number
          center_lng: number
          created_at?: string
          delivery_fee?: number | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          center_lat?: number
          center_lng?: number
          created_at?: string
          delivery_fee?: number | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      status_log: {
        Row: {
          actor_id: string | null
          actor_type: string
          batch_id: string | null
          created_at: string
          from_status: string | null
          id: number
          note: string | null
          order_id: string | null
          to_status: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_type: string
          batch_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: never
          note?: string | null
          order_id?: string | null
          to_status?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          batch_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: never
          note?: string | null
          order_id?: string | null
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_log_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "po_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _batch_used_gram: { Args: { p_batch_id: string }; Returns: number }
      _cancel_batch_orders: {
        Args: { p_actor: string; p_batch_id: string; p_reason: string }
        Returns: number
      }
      _grace_period: { Args: never; Returns: string }
      _in_service_area: {
        Args: { p_lat: number; p_lng: number }
        Returns: boolean
      }
      _log_status: {
        Args: {
          p_actor_type: string
          p_batch_id: string
          p_from: string
          p_note?: string
          p_order_id: string
          p_to: string
        }
        Returns: undefined
      }
      _require_admin: { Args: { p_roles: string[] }; Returns: string }
      admin_role: { Args: never; Returns: string }
      apply_payment_notification: {
        Args: {
          p_fraud_status?: string
          p_gross_amount: number
          p_invoice_number: string
          p_payment_type?: string
          p_raw_payload: Json
          p_transaction_id: string
          p_transaction_status: string
          p_transaction_time: string
        }
        Returns: string
      }
      batch_arrive: { Args: { p_batch_id: string }; Returns: number }
      batch_cancel: {
        Args: { p_batch_id: string; p_note: string }
        Returns: number
      }
      batch_depart: { Args: { p_batch_id: string }; Returns: number }
      cari_pesanan: {
        Args: { p_invoice: string; p_ip_hash: string; p_phone: string }
        Returns: string
      }
      create_order: {
        Args: {
          p_address_note?: string
          p_address_text: string
          p_area_id: string
          p_batch_id: string
          p_buyer_name: string
          p_buyer_phone: string
          p_consent: boolean
          p_ip_hash?: string
          p_items: Json
          p_lat: number
          p_lng: number
          p_recipient_name?: string
          p_recipient_phone?: string
        }
        Returns: {
          expires_at: string
          invoice_number: string
          order_id: string
          status_token: string
          total_amount: number
        }[]
      }
      get_open_batch: {
        Args: never
        Returns: {
          capacity_gram: number
          checkout_closes_at: string
          close_order_at: string
          delivery_date: string
          id: string
          max_order_weight_gram: number
          name: string
          remaining_gram: number
          used_gram: number
        }[]
      }
      order_cancel: {
        Args: {
          p_note?: string
          p_order_id: string
          p_reason: string
          p_refund?: boolean
        }
        Returns: undefined
      }
      order_complete: {
        Args: { p_order_id: string; p_proof_path?: string }
        Returns: undefined
      }
      order_delivery_failed: {
        Args: { p_order_id: string; p_reason: string }
        Returns: undefined
      }
      order_start_delivery: { Args: { p_order_id: string }; Returns: undefined }
      refund_complete: {
        Args: { p_proof_path: string; p_refund_id: string }
        Returns: undefined
      }
      run_scheduled_jobs: { Args: never; Returns: undefined }
      simpan_tautan_bayar: {
        Args: {
          p_order_id: string
          p_redirect_url: string
          p_snap_token: string
        }
        Returns: boolean
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
