import { ApiClient, RequestOptions } from '../types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class MockApiClient implements ApiClient {
  private baseDelay = 500; // Artificial latency

  async get<T>(url: string, _options?: RequestOptions): Promise<T> {
    await delay(this.baseDelay);
    console.log(`[Mock API GET] ${url}`);
    
    // Default mock behavior
    return {} as T;
  }

  async post<T>(url: string, body?: unknown, _options?: RequestOptions): Promise<T> {
    await delay(this.baseDelay);
    console.log(`[Mock API POST] ${url}`, body);
    
    return {} as T;
  }

  async put<T>(url: string, body?: unknown, _options?: RequestOptions): Promise<T> {
    await delay(this.baseDelay);
    console.log(`[Mock API PUT] ${url}`, body);
    
    return {} as T;
  }

  async delete<T>(url: string, _options?: RequestOptions): Promise<T> {
    await delay(this.baseDelay);
    console.log(`[Mock API DELETE] ${url}`);
    
    return {} as T;
  }
}

export const mockClient = new MockApiClient();
