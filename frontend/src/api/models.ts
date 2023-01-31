export interface QueryParams {
  [key: string]: string | number | undefined;
}

export interface Scheme {
  id: string,
  thumbnail: string | null,
  pictures: Record<string, string>;
}

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

export interface Mocker<T> {
  data?: T;
  delay?: number;
}
