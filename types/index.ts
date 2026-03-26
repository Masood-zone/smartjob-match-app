export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  error?: string;
};