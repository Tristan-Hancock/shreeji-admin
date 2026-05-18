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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'delivery_boy'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'delivery_boy'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'delivery_boy'
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          image_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          price: number
          stock_qty: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          price: number
          stock_qty: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          price?: number
          stock_qty?: number
          is_active?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_name: string
          customer_phone: string
          customer_address: string
          pincode: string
          total_amount: number
          payment_method: 'cod' | 'online'
          status: 'pending' | 'accepted' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled'
          delivery_boy_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_phone: string
          customer_address: string
          pincode: string
          total_amount: number
          payment_method: 'cod' | 'online'
          status?: 'pending' | 'accepted' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled'
          delivery_boy_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_phone?: string
          customer_address?: string
          pincode?: string
          total_amount?: number
          payment_method?: 'cod' | 'online'
          status?: 'pending' | 'accepted' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled'
          delivery_boy_id?: string | null
          created_at?: string
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
