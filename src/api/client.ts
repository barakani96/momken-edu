import { ApiClient } from './types';
import { mockClient } from './mock/mockClient';

// Use environment variable to determine which client to use
// For this foundation phase, we'll just use the mock client
const useMock = import.meta.env.VITE_API_MODE === 'mock' || true;

export const apiClient: ApiClient = useMock ? mockClient : mockClient; // Fallback to mock for now
