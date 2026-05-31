import type { IHttpResponse } from '@composables/useFetchHttp';

export type { IHttpResponse };

export interface IPaginatedResponse<T> {
  success: boolean;
  code: number;
  title: string;
  message: string;
  data: {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}
