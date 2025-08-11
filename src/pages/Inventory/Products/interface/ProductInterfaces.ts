export interface Product {
  id?: number;
  name: string;
  code: string;
  category_id: number | null;
  category_name?: string;
  lab_id: number | null;
  lab_name?: string;
  type_id: number | null;
  type_name?: string;
  presentation_id: number | null;
  presentation_name?: string;
  stock: number;
  price: number;
  min_stock: number;
  image?: string | File;
  pharmaceutical_form: string;
  description: string;
  batch: string;
  expiration_date: string;
  manufacturing_date: string;
  concentration: string;
  storage_condition_id: number | null;
  status: string;
  requires_prescription: boolean;
  is_controlled: boolean;
}
