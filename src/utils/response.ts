export type ApiResponse<T = any> = {
  status: number;
  message: string;
  data?: T | null;
  error?: any;
};

export const ok = <T>(message: string, data?: T): ApiResponse<T> => ({
  status: 200,
  message,
  data: data ?? null,
});

export const created = <T>(message: string, data?: T): ApiResponse<T> => ({
  status: 201,
  message,
  data: data ?? null,
});

export const badRequest = (message: string, error?: any): ApiResponse => ({
  status: 400,
  message,
  error,
});

export const unauthorized = (message = "Unauthorized"): ApiResponse => ({
  status: 401,
  message,
});

export const forbidden = (message = "Forbidden"): ApiResponse => ({
  status: 403,
  message,
});

export const notFound = (message = "Not Found"): ApiResponse => ({
  status: 404,
  message,
});

export const serverError = (message = "Internal Server Error", error?: any): ApiResponse => ({
  status: 500,
  message,
  error,
});
