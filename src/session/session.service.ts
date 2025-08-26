import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class SessionService {
  constructor(
    @Inject(CACHE_MANAGER) 
    private cacheManager: Cache
  ) {}

  // Session-related methods
  async setSessionData(sessionId: string, key: string, value: any): Promise<void> {
    const sessionKey = `session:${sessionId}:${key}`;
    await this.cacheManager.set(sessionKey, value, 3600); // 1 hour TTL
  }

  async getSessionData(sessionId: string, key: string): Promise<any> {
    const sessionKey = `session:${sessionId}:${key}`;
    return await this.cacheManager.get(sessionKey);
  }

  async deleteSessionData(sessionId: string, key: string): Promise<void> {
    const sessionKey = `session:${sessionId}:${key}`;
    await this.cacheManager.del(sessionKey);
  }

  async clearSession(sessionId: string): Promise<void> {
    // Note: This is a simple implementation. For production, you might want to
    // track session keys more efficiently
    const pattern = `session:${sessionId}:*`;
    // Since we're using memory store, we'll need to implement a way to clear by pattern
    // For now, this is a placeholder for the concept
  }

  // General cache methods
  async setCacheData(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl || 300); // Default 5 minutes
  }

  async getCacheData(key: string): Promise<any> {
    return await this.cacheManager.get(key);
  }

  async deleteCacheData(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async clearAllCache(): Promise<void> {
    // Note: reset method might not be available in all cache stores
    // This is store-dependent functionality
    if (typeof (this.cacheManager as any).reset === 'function') {
      await (this.cacheManager as any).reset();
    }
  }
}
