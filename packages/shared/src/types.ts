export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: unknown;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    roles: string[];
    permissions: string[];
    locale: string;
  };
  tokens: AuthTokens;
}
