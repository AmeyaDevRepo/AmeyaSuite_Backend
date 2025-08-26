import { Controller, Post, Body, Session, Get, HttpException, HttpStatus, Res, Req } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

interface SignupDto { email: string; password: string; firstName?: string; lastName?: string; name?: string }
interface LoginDto { email: string; password: string }

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private serializeUser(u: any) {
    if (!u) return null;
    // Provide a unified 'name' field for frontend (falls back gracefully)
    const name = u.firstName || u.lastName ? [u.firstName, u.lastName].filter(Boolean).join(' ') : (u.name || null);
    return { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, name };
  }

  @Post('signup')
  async signup(@Body() body: SignupDto, @Session() session: Record<string, any>, @Req() req: any) {
    if (!body.email || !body.password) {
      throw new HttpException('EMAIL_AND_PASSWORD_REQUIRED', HttpStatus.BAD_REQUEST);
    }
    try {
  const raw = await this.authService.signup(body);
  const serialized = this.serializeUser(raw);
  session.userId = raw.id;
  session.user = serialized;
  req.user = serialized;
  return { user: serialized };
    } catch (e: any) {
      if (e.message === 'EMAIL_IN_USE') {
        throw new HttpException('EMAIL_IN_USE', HttpStatus.CONFLICT);
      }
      const isProd = process.env.NODE_ENV === 'production';
      if (isProd) {
        // Generic, safe response for production
        throw new HttpException('INTERNAL_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      // Verbose response for development to aid debugging
      throw new HttpException({
        error: 'SIGNUP_FAILED',
        message: e?.message || 'Unknown error',
        detail: e?.code || undefined,
        stack: (e?.stack ? e.stack.split('\n').slice(0,4).join('\n') : undefined)
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Alias route for frontend expecting /auth/register
  @Post('register')
  async register(@Body() body: SignupDto, @Session() session: Record<string, any>, @Req() req: any) {
    return this.signup(body, session, req);
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Session() session: Record<string, any>, @Req() req: any) {
    if (!body.email || !body.password) {
      throw new HttpException('EMAIL_AND_PASSWORD_REQUIRED', HttpStatus.BAD_REQUEST);
    }
  const raw = await this.authService.validateUser(body.email, body.password);
  if (!raw) {
      throw new HttpException('INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);
    }
  const serialized = this.serializeUser(raw);
  session.userId = raw.id;
  session.user = serialized;
  req.user = serialized;
  return { user: serialized };
  }

  @Post('logout')
  async logout(@Session() session: Record<string, any>, @Res() res: Response) {
    const cookieName = 'ameyaSuite';
    session.destroy?.(() => {});
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return res.json({ success: true });
  }

  @Get('me')
  async me(@Session() session: Record<string, any>, @Req() req: any) {
    if (!session.userId) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
  if (session.user) {
    req.user = session.user;
    return { user: session.user };
  }
  const raw = await this.authService.getUserById(session.userId);
  const serialized = this.serializeUser(raw);
  session.user = serialized;
  req.user = serialized;
  return { user: serialized };
  }
}
