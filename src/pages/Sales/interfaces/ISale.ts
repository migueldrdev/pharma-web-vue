export interface ISale {
  id: number;
  sale_date: string;
  total: number;
  client_id: number | null;
  client_name: string | null;
  customer_name: string | null;
  document_type_id: number | null;
  document_type_name?: string;
  document_number: string | null;
  active: number;
  status?: string;
  details?: ISaleDetail[];
}

export interface ISaleDetail {
  id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  price: number;
  subtotal: number;
}
