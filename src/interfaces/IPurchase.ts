export interface IPurchase {
  id: number;
  date: string;
  total: number;
  supplier_name: string;
  supplier_id?: number;
  document_type_id?: number;
  document_number?: string;
  created_at?: string;
  updated_at?: string;
  details?: IPurchaseDetail[];
}

export interface IPurchaseDetail {
  id?: number;
  purchase_id?: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  batch_number?: string;
  expiration_date?: string;
}
