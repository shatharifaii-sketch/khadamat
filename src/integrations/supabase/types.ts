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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      contact_rate_limits: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown
          submissions_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address: unknown
          submissions_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          submissions_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      conversation_analytics: {
        Row: {
          client_id: string
          conversation_id: string
          id: string
          last_activity_at: string | null
          message_count: number | null
          provider_id: string
          service_id: string
          started_at: string
          status: string | null
        }
        Insert: {
          client_id: string
          conversation_id: string
          id?: string
          last_activity_at?: string | null
          message_count?: number | null
          provider_id: string
          service_id: string
          started_at?: string
          status?: string | null
        }
        Update: {
          client_id?: string
          conversation_id?: string
          id?: string
          last_activity_at?: string | null
          message_count?: number | null
          provider_id?: string
          service_id?: string
          started_at?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_analytics_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: true
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_analytics_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "public_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_analytics_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          client_id: string
          created_at: string
          id: string
          last_message_at: string | null
          provider_id: string
          service_id: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          provider_id: string
          service_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          provider_id?: string
          service_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "public_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          applied_at: string
          coupon_id: string
          discount_applied: number
          id: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string
          coupon_id: string
          discount_applied?: number
          id?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string
          coupon_id?: string
          discount_applied?: number
          id?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          expires_at: string | null
          id: string
          stripe_coupon_id: string | null
          stripe_promo_id: string | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at: string
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          stripe_coupon_id?: string | null
          stripe_promo_id?: string | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          stripe_coupon_id?: string | null
          stripe_promo_id?: string | null
          type?: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number | null
          billing_reason: string | null
          created_at: string
          currency: string | null
          id: number
          status: string | null
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          stripe_subscription_id: string | null
          stripe_subscription_item_id: string | null
          subscription_id: string | null
          subscription_transaction_id: string | null
          subtotal: number | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          billing_reason?: string | null
          created_at?: string
          currency?: string | null
          id?: number
          status?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_item_id?: string | null
          subscription_id?: string | null
          subscription_transaction_id?: string | null
          subtotal?: number | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          billing_reason?: string | null
          created_at?: string
          currency?: string | null
          id?: number
          status?: string | null
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_item_id?: string | null
          subscription_id?: string | null
          subscription_transaction_id?: string | null
          subtotal?: number | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_transaction_id_fkey"
            columns: ["subscription_transaction_id"]
            isOneToOne: false
            referencedRelation: "subscription_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          file_url: string | null
          id: string
          message_type: string
          read_at: string | null
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          file_url?: string | null
          id?: string
          message_type?: string
          read_at?: string | null
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          file_url?: string | null
          id?: string
          message_type?: string
          read_at?: string | null
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey1"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey1"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_settings: {
        Row: {
          created_at: string | null
          id: number
          otp_expiry: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          otp_expiry: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          otp_expiry?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          email: string | null
          id: number
          token: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          token?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          token?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          discount_applied: number | null
          id: string
          original_amount: number | null
          paid_for: string | null
          payment_data: Json | null
          payment_method: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          currency?: string
          discount_applied?: number | null
          id?: string
          original_amount?: number | null
          paid_for?: string | null
          payment_data?: Json | null
          payment_method: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          discount_applied?: number | null
          id?: string
          original_amount?: number | null
          paid_for?: string | null
          payment_data?: Json | null
          payment_method?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          experience_years: number | null
          full_name: string | null
          id: string
          is_service_provider: boolean | null
          location: string | null
          phone: string | null
          profile_image_url: string | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          full_name?: string | null
          id: string
          is_service_provider?: boolean | null
          location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          full_name?: string | null
          id?: string
          is_service_provider?: boolean | null
          location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles_images: {
        Row: {
          created_at: string
          id: string
          image_name: string | null
          image_url: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_name?: string | null
          image_url: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_name?: string | null
          image_url?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_images_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_images_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action_type: string
          attempts: number | null
          created_at: string | null
          id: string
          ip_address: unknown
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          action_type: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          action_type?: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          email: string
          id: number
          name: string
          object_id: string | null
          object_type: string | null
          phone_number: string | null
          report_message: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          name: string
          object_id?: string | null
          object_type?: string | null
          phone_number?: string | null
          report_message: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          name?: string
          object_id?: string | null
          object_type?: string | null
          phone_number?: string | null
          report_message?: string
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          category: string | null
          created_at: string
          id: string
          ip_address: unknown
          location: string | null
          results_count: number | null
          search_query: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          location?: string | null
          results_count?: number | null
          search_query: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          location?: string | null
          results_count?: number | null
          search_query?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_analytics: {
        Row: {
          action_type: string
          created_at: string
          id: string
          ip_address: unknown
          referrer: string | null
          service_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          ip_address?: unknown
          referrer?: string | null
          service_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          referrer?: string | null
          service_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_analytics_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "public_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_analytics_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_images: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_name: string | null
          image_url: string
          service_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_name?: string | null
          image_url: string
          service_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_name?: string | null
          image_url?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_images_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "public_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_images_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reviews: {
        Row: {
          created_at: string
          id: string
          rating: number
          review_body: string
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating?: number
          review_body?: string
          service_id?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          review_body?: string
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "public_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          created_at: string
          description: string
          email: string
          experience: string | null
          id: string
          is_online: boolean | null
          location: string
          phone: string
          price_range: string
          status: string
          title: string
          updated_at: string
          user_id: string
          views: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          email: string
          experience?: string | null
          id?: string
          is_online?: boolean | null
          location: string
          phone: string
          price_range: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          views?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          email?: string
          experience?: string | null
          id?: string
          is_online?: boolean | null
          location?: string
          phone?: string
          price_range?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_services_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_services_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_checkout_sessions: {
        Row: {
          attrs: Json | null
          customer: string | null
          id: string | null
          payment_intent: string | null
          subscription: string | null
        }
        Insert: {
          attrs?: Json | null
          customer?: string | null
          id?: string | null
          payment_intent?: string | null
          subscription?: string | null
        }
        Update: {
          attrs?: Json | null
          customer?: string | null
          id?: string | null
          payment_intent?: string | null
          subscription?: string | null
        }
        Relationships: []
      }
      stripe_customer_data: {
        Row: {
          attrs: Json | null
          created: string | null
          description: string | null
          email: string | null
          id: string | null
          name: string | null
        }
        Insert: {
          attrs?: Json | null
          created?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
        }
        Update: {
          attrs?: Json | null
          created?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
        }
        Relationships: []
      }
      stripe_invoices: {
        Row: {
          attrs: Json | null
          currency: string | null
          customer: string | null
          id: string | null
          period_end: string | null
          period_start: string | null
          status: string | null
          subscription: string | null
          total: number | null
        }
        Insert: {
          attrs?: Json | null
          currency?: string | null
          customer?: string | null
          id?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          subscription?: string | null
          total?: number | null
        }
        Update: {
          attrs?: Json | null
          currency?: string | null
          customer?: string | null
          id?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          subscription?: string | null
          total?: number | null
        }
        Relationships: []
      }
      stripe_prices: {
        Row: {
          active: boolean | null
          attrs: Json | null
          created: string | null
          currency: string | null
          id: string | null
          product: string | null
          type: string | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          id?: string | null
          product?: string | null
          type?: string | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          id?: string | null
          product?: string | null
          type?: string | null
          unit_amount?: number | null
        }
        Relationships: []
      }
      stripe_products: {
        Row: {
          active: boolean | null
          attrs: Json | null
          created: string | null
          default_price: string | null
          description: string | null
          id: string | null
          name: string | null
          updated: string | null
        }
        Insert: {
          active?: boolean | null
          attrs?: Json | null
          created?: string | null
          default_price?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          updated?: string | null
        }
        Update: {
          active?: boolean | null
          attrs?: Json | null
          created?: string | null
          default_price?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          updated?: string | null
        }
        Relationships: []
      }
      stripe_subscriptions: {
        Row: {
          attrs: Json | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          customer: string | null
          id: string | null
        }
        Insert: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Update: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          allowed_services: number | null
          badge_class_name: string | null
          class_name: string | null
          created_at: string
          free_trial: boolean | null
          free_trial_period: number | null
          free_trial_period_text: string | null
          id: string
          notes: Json | null
          price_monthly_title: string | null
          price_monthly_value: number | null
          price_yearly_title: string | null
          price_yearly_value: number | null
          stripe_monthly_price_id: string
          stripe_product_id: string
          stripe_yearly_price_id: string
          tier: number | null
          title: string | null
          users: number
        }
        Insert: {
          allowed_services?: number | null
          badge_class_name?: string | null
          class_name?: string | null
          created_at?: string
          free_trial?: boolean | null
          free_trial_period?: number | null
          free_trial_period_text?: string | null
          id?: string
          notes?: Json | null
          price_monthly_title?: string | null
          price_monthly_value?: number | null
          price_yearly_title?: string | null
          price_yearly_value?: number | null
          stripe_monthly_price_id: string
          stripe_product_id: string
          stripe_yearly_price_id: string
          tier?: number | null
          title?: string | null
          users?: number
        }
        Update: {
          allowed_services?: number | null
          badge_class_name?: string | null
          class_name?: string | null
          created_at?: string
          free_trial?: boolean | null
          free_trial_period?: number | null
          free_trial_period_text?: string | null
          id?: string
          notes?: Json | null
          price_monthly_title?: string | null
          price_monthly_value?: number | null
          price_yearly_title?: string | null
          price_yearly_value?: number | null
          stripe_monthly_price_id?: string
          stripe_product_id?: string
          stripe_yearly_price_id?: string
          tier?: number | null
          title?: string | null
          users?: number
        }
        Relationships: []
      }
      subscription_transactions: {
        Row: {
          amount: number | null
          billing_period_end: string | null
          billing_period_start: string | null
          billing_reason: string | null
          coupon_id: string | null
          coupon_used: boolean | null
          created_at: string
          currency: string | null
          email_sent: boolean | null
          id: string
          invoice_id: number | null
          invoice_url: string | null
          payment_date: string | null
          payment_status: string | null
          status: string
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          stripe_subscription_id: string | null
          stripe_subscription_item_id: string | null
          subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          billing_period_end?: string | null
          billing_period_start?: string | null
          billing_reason?: string | null
          coupon_id?: string | null
          coupon_used?: boolean | null
          created_at?: string
          currency?: string | null
          email_sent?: boolean | null
          id?: string
          invoice_id?: number | null
          invoice_url?: string | null
          payment_date?: string | null
          payment_status?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_item_id?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          billing_period_end?: string | null
          billing_period_start?: string | null
          billing_reason?: string | null
          coupon_id?: string | null
          coupon_used?: boolean | null
          created_at?: string
          currency?: string | null
          email_sent?: boolean | null
          id?: string
          invoice_id?: number | null
          invoice_url?: string | null
          payment_date?: string | null
          payment_status?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_item_id?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_transactions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          auto_renew: boolean | null
          billing_cycle: string
          coupon_id: string | null
          created_at: string
          currency: string
          expires_at: string
          id: string
          is_in_trial: boolean
          is_payment_pastdue: boolean | null
          last_payment_date: string | null
          latest_stripe_invoice_id: string | null
          next_payment_date: string | null
          payment_method: string | null
          services_allowed: number | null
          services_used: number | null
          started_at: string
          status: string
          stripe_coupon_id: string | null
          stripe_customer_id: string | null
          stripe_discount_id: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          stripe_promotion_id: string | null
          stripe_subscription_id: string | null
          stripe_subscription_item_id: string | null
          subscription_ended_at: string | null
          tier_id: string | null
          trial_expires_at: string | null
          updated_at: string
          used_coupon_on_start: boolean | null
          user_id: string
        }
        Insert: {
          amount?: number
          auto_renew?: boolean | null
          billing_cycle?: string
          coupon_id?: string | null
          created_at?: string
          currency?: string
          expires_at?: string
          id?: string
          is_in_trial?: boolean
          is_payment_pastdue?: boolean | null
          last_payment_date?: string | null
          latest_stripe_invoice_id?: string | null
          next_payment_date?: string | null
          payment_method?: string | null
          services_allowed?: number | null
          services_used?: number | null
          started_at?: string
          status?: string
          stripe_coupon_id?: string | null
          stripe_customer_id?: string | null
          stripe_discount_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_promotion_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_item_id?: string | null
          subscription_ended_at?: string | null
          tier_id?: string | null
          trial_expires_at?: string | null
          updated_at?: string
          used_coupon_on_start?: boolean | null
          user_id: string
        }
        Update: {
          amount?: number
          auto_renew?: boolean | null
          billing_cycle?: string
          coupon_id?: string | null
          created_at?: string
          currency?: string
          expires_at?: string
          id?: string
          is_in_trial?: boolean
          is_payment_pastdue?: boolean | null
          last_payment_date?: string | null
          latest_stripe_invoice_id?: string | null
          next_payment_date?: string | null
          payment_method?: string | null
          services_allowed?: number | null
          services_used?: number | null
          started_at?: string
          status?: string
          stripe_coupon_id?: string | null
          stripe_customer_id?: string | null
          stripe_discount_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_promotion_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_item_id?: string | null
          subscription_ended_at?: string | null
          tier_id?: string | null
          trial_expires_at?: string | null
          updated_at?: string
          used_coupon_on_start?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      table_name: {
        Row: {
          data: Json | null
          id: number
          inserted_at: string
          name: string | null
          updated_at: string
        }
        Insert: {
          data?: Json | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          data?: Json | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"] | null
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_type?: Database["public"]["Enums"]["activity_type"] | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"] | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string
          id: number
          report_description: string | null
          reported_id: string | null
          reporter_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          report_description?: string | null
          reported_id?: string | null
          reporter_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          report_description?: string | null
          reported_id?: string | null
          reporter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      profiles_with_email: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string | null
          experience_years: number | null
          full_name: string | null
          id: string | null
          is_service_provider: boolean | null
          location: string | null
          phone: string | null
          profile_image_url: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      public_services: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          email: string | null
          experience: string | null
          id: string | null
          location: string | null
          phone: string | null
          price_range: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          views: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          experience?: string | null
          id?: string | null
          location?: string | null
          phone?: string | null
          price_range?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          experience?: string | null
          id?: string | null
          location?: string | null
          phone?: string | null
          price_range?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_services_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_services_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_contact_rate_limit: {
        Args: { _ip_address: unknown }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          _action_type?: string
          _ip_address?: unknown
          _max_attempts?: number
          _user_id?: string
          _window_minutes?: number
        }
        Returns: boolean
      }
      daily_login_activity: {
        Args: { days_back?: number }
        Returns: {
          day: string
          user_count: number
        }[]
      }
      get_category_analytics: {
        Args: never
        Returns: {
          category: string
          searches: number
          views: number
        }[]
      }
      get_conversation_details: {
        Args: { p_user_id: string }
        Returns: {
          client_id: string
          conversation_type: string
          created_at: string
          id: string
          last_message_at: string
          other_party_name: string
          provider_id: string
          service_id: string
          service_title: string
          status: string
          unread_count: number
          updated_at: string
        }[]
      }
      get_subscription_data_with_stripe: {
        Args: { tier_id: string }
        Returns: Json
      }
      get_top_search_terms: {
        Args: never
        Returns: {
          count: number
          query: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { uid: string }; Returns: boolean }
      log_admin_action: {
        Args: {
          _action_type: string
          _new_values?: Json
          _old_values?: Json
          _record_id?: string
          _table_name?: string
        }
        Returns: undefined
      }
      login_activity_summary: { Args: never; Returns: Json }
      mark_message_as_read: { Args: { message_id: string }; Returns: undefined }
      monthly_login_activity: {
        Args: { months_back?: number }
        Returns: {
          month: string
          user_count: number
        }[]
      }
      validate_admin_input: { Args: { input_text: string }; Returns: boolean }
      validate_coupon: {
        Args: { coupon_code: string; user_id: string }
        Returns: {
          coupon_id: string
          coupon_type: string
          discount_amount: number
          discount_percentage: number
          message: string
          valid: boolean
        }[]
      }
      yearly_login_activity: {
        Args: { years_back?: number }
        Returns: {
          user_count: number
          year: string
        }[]
      }
    }
    Enums: {
      activity_type: "login" | "logout"
      app_role: "admin" | "moderator" | "user"
      coupon_type:
        | "first_month_free"
        | "three_months_for_one"
        | "percentage"
        | "fixed"
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
      activity_type: ["login", "logout"],
      app_role: ["admin", "moderator", "user"],
      coupon_type: [
        "first_month_free",
        "three_months_for_one",
        "percentage",
        "fixed",
      ],
    },
  },
} as const
