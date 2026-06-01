export interface IPurchase {
  id: number;
  purchase_date: string;
  total: number;
  supplier_id: number | null;
  supplier_name?: string;
  document_type_id?: number;
  document_number?: string;
  active: number;
  details?: IPurchaseDetail[];
}

export interface IPurchaseDetail {
  id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  price: number;
  subtotal: number;
  batch_number?: string;
  expiration_date?: string;
}

export interface ISupplier {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  active?: number;
}
