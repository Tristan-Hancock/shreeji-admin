export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      // ─── Auth / Users ─────────────────────────────────────────────────────
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'admin' | 'delivery_boy'
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'admin' | 'delivery_boy'
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'admin' | 'delivery_boy'
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }

      // ─── Catalog ──────────────────────────────────────────────────────────
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      products: {
        Row: {
          id: string
          category_id: string
          name: string
          slug: string
          brand: string | null
          description: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          slug: string
          brand?: string | null
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          slug?: string
          brand?: string | null
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      product_variants: {
        Row: {
          id: string
          product_id: string
          variant_name: string
          unit_value: string | null
          unit_type: string | null
          price: number
          mrp: number | null
          stock_qty: number
          sku: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          variant_name: string
          unit_value?: string | null
          unit_type?: string | null
          price: number
          mrp?: number | null
          stock_qty?: number
          sku?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          variant_name?: string
          unit_value?: string | null
          unit_type?: string | null
          price?: number
          mrp?: number | null
          stock_qty?: number
          sku?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // ─── Orders ───────────────────────────────────────────────────────────
      orders: {
        Row: {
          id: string
          customer_name: string
          phone: string
          address_line_1: string
          address_line_2: string | null
          landmark: string | null
          city: string
          state: string
          pincode: string
          subtotal: number
          delivery_fee: number
          total: number
          payment_method: 'cod' | 'upi'
          payment_status: 'pending' | 'completed' | 'failed'
          order_status: 'pending' | 'completed' | 'cancelled'
          delivery_boy_id: string | null
          assigned_at: string | null
          delivered_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          phone: string
          address_line_1: string
          address_line_2?: string | null
          landmark?: string | null
          city: string
          state: string
          pincode: string
          subtotal: number
          delivery_fee?: number
          total: number
          payment_method: 'cod' | 'upi'
          payment_status?: 'pending' | 'completed' | 'failed'
          order_status?: 'pending' | 'completed' | 'cancelled'
          delivery_boy_id?: string | null
          assigned_at?: string | null
          delivered_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          phone?: string
          address_line_1?: string
          address_line_2?: string | null
          landmark?: string | null
          city?: string
          state?: string
          pincode?: string
          subtotal?: number
          delivery_fee?: number
          total?: number
          payment_method?: 'cod' | 'upi'
          payment_status?: 'pending' | 'completed' | 'failed'
          order_status?: 'pending' | 'completed' | 'cancelled'
          delivery_boy_id?: string | null
          assigned_at?: string | null
          delivered_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      order_items: {
        Row: {
          id: string
          order_id: string
          variant_id: string
          product_name: string
          variant_name: string
          quantity: number
          price_at_order: number
        }
        Insert: {
          id?: string
          order_id: string
          variant_id: string
          product_name: string
          variant_name: string
          quantity: number
          price_at_order: number
        }
        Update: {
          id?: string
          order_id?: string
          variant_id?: string
          product_name?: string
          variant_name?: string
          quantity?: number
          price_at_order?: number
        }
      }

      // ─── Logistics ────────────────────────────────────────────────────────
      serviceable_pincodes: {
        Row: {
          pincode: string
          is_active: boolean
          delivery_fee: number
          min_order_value: number
        }
        Insert: {
          pincode: string
          is_active?: boolean
          delivery_fee: number
          min_order_value: number
        }
        Update: {
          pincode?: string
          is_active?: boolean
          delivery_fee?: number
          min_order_value?: number
        }
      }
    }
  }
}
