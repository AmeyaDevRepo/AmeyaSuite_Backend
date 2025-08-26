import { Controller, Get, Post, Body, Session, Param, Delete } from '@nestjs/common';
import { SessionService } from './session.service';
import { CacheExampleService } from './cache-example.service';

@Controller('session')
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly cacheExampleService: CacheExampleService
  ) {}

  @Post('set')
  async setSessionData(
    @Session() session: Record<string, any>,
    @Body() body: { key: string; value: any }
  ) {
    // Store in express-session
    session[body.key] = body.value;
    
    // Also store in cache if session ID is available
    if (session.id) {
      await this.sessionService.setSessionData(session.id, body.key, body.value);
    }
    
    return { success: true, message: 'Session data set successfully' };
  }

  @Get('get/:key')
  async getSessionData(
    @Session() session: Record<string, any>,
    @Param('key') key: string
  ) {
    // Get from express-session first
    const sessionValue = session[key];
    
    // If not found and session ID exists, try cache
    if (!sessionValue && session.id) {
      const cacheValue = await this.sessionService.getSessionData(session.id, key);
      return { key, value: cacheValue || null };
    }
    
    return { key, value: sessionValue || null };
  }

  @Delete('delete/:key')
  async deleteSessionData(
    @Session() session: Record<string, any>,
    @Param('key') key: string
  ) {
    // Delete from express-session
    delete session[key];
    
    // Delete from cache if session ID exists
    if (session.id) {
      await this.sessionService.deleteSessionData(session.id, key);
    }
    
    return { success: true, message: 'Session data deleted successfully' };
  }

  @Get('info')
  getSessionInfo(@Session() session: Record<string, any>) {
    return {
      sessionId: session.id || 'No session ID',
      sessionData: session,
    };
  }

  // Cache management endpoints
  @Post('cache/set')
  async setCacheData(@Body() body: { key: string; value: any; ttl?: number }) {
    await this.sessionService.setCacheData(body.key, body.value, body.ttl);
    return { success: true, message: 'Cache data set successfully' };
  }

  @Get('cache/get/:key')
  async getCacheData(@Param('key') key: string) {
    const value = await this.sessionService.getCacheData(key);
    return { key, value: value || null };
  }

  @Delete('cache/delete/:key')
  async deleteCacheData(@Param('key') key: string) {
    await this.sessionService.deleteCacheData(key);
    return { success: true, message: 'Cache data deleted successfully' };
  }

  @Delete('cache/clear')
  async clearCache() {
    await this.sessionService.clearAllCache();
    return { success: true, message: 'Cache cleared successfully' };
  }

  // Cache example endpoints
  @Get('example/user/:id')
  async getCachedUserData(@Param('id') id: string) {
    const userData = await this.cacheExampleService.getUserData(id);
    return userData;
  }

  @Get('example/uncached')
  async getUncachedData() {
    const data = await this.cacheExampleService.getUncachedData();
    return data;
  }

  @Delete('example/user/:id/cache')
  async invalidateUserCache(@Param('id') id: string) {
    await this.cacheExampleService.invalidateUserCache(id);
    return { success: true, message: `Cache invalidated for user ${id}` };
  }
}
