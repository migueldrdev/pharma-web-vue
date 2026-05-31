export interface IProduct {
  id: number;
  name: string;
  code: string;
  category_id: number;
  category_name?: string;
  lab_id: number;
  lab_name?: string;
  pharmaceutical_form?: string;
  product_type_id?: number;
  product_type_name?: string;
  product_presentation_id?: number;
  product_presentation_name?: string;
  stock: number;
  min_stock?: number;
  price: number;
  description?: string;
  batch_number?: string;
  expiration_date?: string;
  manufacturing_date?: string;
  concentration?: string;
  storage_condition_id?: number;
  storage_condition_name?: string;
  status: 'active' | 'inactive' | 'discontinued' | 'out_of_stock';
  requires_prescription?: boolean;
  controlled_medication?: boolean;
  image_url?: string;
  active: number;
  created_at?: string;
  updated_at?: string;
}

export interface IProductFormData {
  name: string;
  code: string;
  category_id: number | null;
  lab_id: number | null;
  pharmaceutical_form: string;
  product_type_id: number | null;
  product_presentation_id: number | null;
  stock: number;
  min_stock: number;
  price: number;
  description: string;
  batch_number: string;
  expiration_date: string;
  manufacturing_date: string;
  concentration: string;
  storage_condition_id: number | null;
  status: IProduct['status'];
  requires_prescription: boolean;
  controlled_medication: boolean;
  image?: File | null;
}
