export interface QueryParams {
  [key: string]: string | number | undefined;
}

export type Resolve = Record<string, string>;

export interface SuccessResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface Pagination {
  current: number;
  total: number;
  page_size: number;
}

export interface ListResponse<T> {
  list: Array<T>;
  pagination: Pagination;
}
