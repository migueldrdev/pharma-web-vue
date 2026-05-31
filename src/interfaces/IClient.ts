export interface IClient {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  document_number?: string;
  active?: number;
  created_at?: string;
  updated_at?: string;
}
