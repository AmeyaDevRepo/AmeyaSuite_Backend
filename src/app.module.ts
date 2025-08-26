import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionModule } from './session/session.module';
import { AuthModule } from './auth/auth.module';
import * as memoryStore from 'cache-manager-memory-store';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true, // Make cache available globally
      store: memoryStore,
      ttl: 300, // Time to live in seconds (5 minutes)
      max: 100, // Maximum number of items in cache
    }),
  SessionModule,
  AuthModule,
  PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
