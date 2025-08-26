import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  private readonly openRoutes = new Set<string>([
    '/auth/login',
    '/auth/signup',
    '/auth/register',
  ]);

  canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToHttp();
    const req: any = ctx.getRequest();

    if (!req) return true; // Non-HTTP
    const method: string = req.method;
    const path: string = (req.path || req.url || '').split('?')[0];

    if (method === 'OPTIONS') return true; // CORS preflight
    if (this.openRoutes.has(path)) return true; // Public endpoints
    if (req.session?.userId) return true; // Authenticated

    throw new UnauthorizedException('UNAUTHORIZED');
  }
}
