export interface ISale {
  id: number;
  date: string;
  total: number;
  client_name: string;
  status: string;
  client_id?: number;
  document_type_id?: number;
  document_number?: string;
  created_at?: string;
  updated_at?: string;
  details?: ISaleDetail[];
}

export interface ISaleDetail {
  id?: number;
  sale_id?: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}
