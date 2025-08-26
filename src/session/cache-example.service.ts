import { Injectable } from '@nestjs/common';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Injectable()
export class CacheExampleService {
  
  // This method will cache its result with default TTL
  @CacheKey('user-data')
  @CacheTTL(60) // Cache for 60 seconds
  async getUserData(userId: string): Promise<any> {
    // Simulate expensive operation
    console.log(`Fetching user data for ID: ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    
    return {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      fetchedAt: new Date().toISOString(),
    };
  }

  // Method without caching
  async getUncachedData(): Promise<any> {
    console.log('Fetching uncached data');
    return {
      data: 'This data is not cached',
      timestamp: new Date().toISOString(),
    };
  }

  // Method that demonstrates cache invalidation
  async invalidateUserCache(userId: string): Promise<void> {
    // In a real application, you would invalidate the cache here
    console.log(`Cache invalidated for user: ${userId}`);
  }
}
