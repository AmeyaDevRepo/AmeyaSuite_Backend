import { Module, Controller, Get, Injectable } from '@nestjs/common';

// Simple in-file SessionService to avoid a missing-module error.
// Move this to a separate file later if you prefer.
@Injectable()
export class SessionService {
  getHealth() {
    return { status: 'ok' };
  }
}
 
// Simple in-file CacheExampleService to keep the module self-contained.
@Injectable()
export class CacheExampleService {
  // Example method; implement cache logic as needed.
  async get<T>(key: string): Promise<T | undefined> {
    return undefined;
  }
}

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('health')
  health() {
    return this.sessionService.getHealth();
  }
}

@Module({
  controllers: [SessionController],
  providers: [SessionService, CacheExampleService],
  exports: [SessionService, CacheExampleService],
})
export class SessionModule {}
