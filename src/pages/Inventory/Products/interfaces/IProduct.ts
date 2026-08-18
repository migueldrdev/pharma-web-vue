export interface IProduct {
  id: number;
  name: string;
  code: string;
  category_id: number;
  category_name?: string;
  lab_id: number;
  lab_name?: string;
  pharmaceutical_form: string;
  type_id: number | null;
  type_name?: string;
  presentation_id: number | null;
  presentation_name?: string;
  stock: number;
  min_stock: number;
  price: number;
  description?: string;
  batch?: string;
  expiration_date?: string;
  manufacturing_date?: string;
  concentration?: string;
  storage_condition_id: number | null;
  storage_condition_label?: string;
  status: 'active' | 'inactive' | 'discontinued' | 'out_of_stock';
  requires_prescription: boolean;
  is_controlled: boolean;
  image?: string;
  ai_suggestion?: string | null;
  active: number;
  created_at?: string;
  updated_at?: string;
}

export interface IProductFilters {
  search: string;
  category_id: number | null;
  lab_id: number | null;
  product_type_id: number | null;
  stock_status: string | null;
}

export interface IProductPagination {
  page: number;
  rowsPerPage: number;
  rowsNumber: number;
  sortBy: string;
  descending: boolean;
}

export interface IProductFormData {
  name: string;
  code: string;
  category_id: number | null;
  lab_id: number | null;
  type_id: number | null;
  presentation_id: number | null;
  stock: number;
  price: number;
  min_stock: number;
  image: string;
  pharmaceutical_form: string;
  description: string;
  batch: string;
  expiration_date: string;
  manufacturing_date: string;
  concentration: string;
  storage_condition_id: number | null;
  status: IProduct['status'];
  requires_prescription: boolean;
  is_controlled: boolean;
}
