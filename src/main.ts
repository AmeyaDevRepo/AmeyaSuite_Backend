import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session = require('express-session');
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure express-session
  app.use(
    session({
      name:"ameyaSuite",
      secret: process.env.SESSION_SECRET || 'default-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'lax',
      },
    }),
  );

  // Enable CORS with support for multiple comma-separated origins
  const rawOrigins = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3001';
  const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(o => o.length);
  console.log('[CORS] Allowed origins:', allowedOrigins.join(', '));
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // server-to-server or curl
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS_NOT_ALLOWED: ${origin}`), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
    exposedHeaders: 'Content-Disposition',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const prismaService = app.get(PrismaService);
  prismaService.enableShutdownHooks(app as any);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();