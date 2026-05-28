export type SkinType = 'dry' | 'oily' | 'combination' | 'sensitive' | 'all';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

export interface ProductImage {
  public_id: string;
  url: string;
  alt: string;
  is_primary: boolean;
}

export interface Product {
  id: string;
  brand_id: string | null;
  category_id: string | null;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  ingredients: string | null;
  how_to_use: string | null;
  skin_types: string[];
  concerns: string[];
  price: number;
  compare_price: number | null;
  currency: string;
  stock: number;
  sku: string | null;
  is_active: boolean;
  is_featured: boolean;
  tag: string | null;
  images: ProductImage[];
  created_at: string;
  updated_at: string;
  // joined
  brands?: Brand;
  categories?: Category;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  skin_type: string | null;
  skin_concerns: string[];
  preferred_currency: string;
  is_admin: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_reference: string | null;
  payment_status: 'unpaid' | 'paid' | 'failed' | 'refunded';
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  products?: Product;
}
