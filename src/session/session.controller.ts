import { Controller, Get, Post, Body, Session, Param, Delete } from '@nestjs/common';
import { SessionService } from './session.service';
import { CacheExampleService } from './cache-example.service';

@Controller('session')
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly cacheExampleService: CacheExampleService
  ) {}

  /**
   * Legacy endpoint: still accepts body.key. Prefer using /session/set/:key
   */
  @Post('set')
  async setSessionDataLegacy(
    @Session() session: Record<string, any>,
    @Body() body: { key: string; value: any }
  ) {
    if (!body?.key) {
      return { success: false, message: 'Missing key. Use POST /session/set/:key instead.' };
    }
    session[body.key] = body.value;
    if (session.id) {
      await this.sessionService.setSessionData(session.id, body.key, body.value);
    }
    return { success: true, message: 'Session data set (legacy).' };
  }

  /**
   * New preferred endpoint: key comes from URL path param.
   * POST /session/set/theme  { value: 'dark' }
   */
  @Post('set/:key')
  async setSessionData(
    @Session() session: Record<string, any>,
    @Param('key') key: string,
    @Body() body: { value: any }
  ) {
    session[key] = body.value;
    if (session.id) {
      await this.sessionService.setSessionData(session.id, key, body.value);
    }
    return { success: true, key, value: body.value, message: 'Session data set successfully' };
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
  // Legacy cache set (still supported)
  @Post('cache/set')
  async setCacheDataLegacy(@Body() body: { key: string; value: any; ttl?: number }) {
    if (!body?.key) {
      return { success: false, message: 'Missing key. Use POST /session/cache/set/:key instead.' };
    }
    await this.sessionService.setCacheData(body.key, body.value, body.ttl);
    return { success: true, key: body.key, value: body.value, ttl: body.ttl ?? null, message: 'Cache data set (legacy).' };
  }

  // Preferred cache set with URL key
  @Post('cache/set/:key')
  async setCacheData(
    @Param('key') key: string,
    @Body() body: { value: any; ttl?: number }
  ) {
    await this.sessionService.setCacheData(key, body.value, body.ttl);
    return { success: true, key, value: body.value, ttl: body.ttl ?? null, message: 'Cache data set successfully' };
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
