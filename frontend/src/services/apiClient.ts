import axios from 'axios';

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getResponseMessage(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null) {
    return undefined;
  }

  const response = data as Record<string, unknown>;
  if (typeof response.message === 'string') {
    return response.message;
  }
  if (typeof response.detail === 'string') {
    return response.detail;
  }
  if (typeof response.title === 'string') {
    return response.title;
  }

  return undefined;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5250',
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const message =
        getResponseMessage(error.response?.data) ??
        error.message ??
        'Đã xảy ra lỗi khi kết nối đến máy chủ.';

      return Promise.reject(new ApiError(message, error.response?.status));
    }

    if (error instanceof Error) {
      return Promise.reject(new ApiError(error.message));
    }

    return Promise.reject(new ApiError('Đã xảy ra lỗi không xác định.'));
  },
);

export default apiClient;
