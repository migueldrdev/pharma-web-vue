export interface IUser {
  id: number;
  name: string;
  email: string;
  role_id?: number;
  role?: IRole;
  active?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IRole {
  id: number;
  name: string;
  permissions: string[];
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
  user: IUser;
}
