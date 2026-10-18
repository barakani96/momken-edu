/**
 * Base utility types for consistent monorepo architecture typing patterns.
 */

/**
 * Common base entity contract with standard audit metadata.
 */
export interface BaseEntity {
  id: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  version?: number;
  isDeleted?: boolean;
}

/**
 * Standardized pagination parameters for list queries across modules.
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
}

/**
 * Generic paginated response wrapper for data grid, API, and repository listings.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Discriminated union Result type for safe functional error handling.
 */
export type Result<T, E = Error> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

/**
 * Helper constructors for creating Result<T> instances.
 */
export const Result = {
  ok: <T>(data: T): Result<T, never> => ({ success: true, data }),
  fail: <E = Error>(error: E): Result<never, E> => ({ success: false, error }),
};

/**
 * Generic dictionary mapping type.
 */
export type Dictionary<T = unknown> = Record<string, T>;

/**
 * Utility type to make specific keys optional.
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type for async operation state representations.
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | string | null;
}
