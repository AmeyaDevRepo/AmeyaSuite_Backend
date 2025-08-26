import { Controller, Post, Body, Session, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

interface SignupDto { email: string; password: string; firstName?: string; lastName?: string; name?: string }
interface LoginDto { email: string; password: string }

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignupDto, @Session() session: Record<string, any>) {
    if (!body.email || !body.password) {
      throw new HttpException('EMAIL_AND_PASSWORD_REQUIRED', HttpStatus.BAD_REQUEST);
    }
    try {
  const user = await this.authService.signup(body);
      session.userId = user.id;
      return { user };
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

  @Post('login')
  async login(@Body() body: LoginDto, @Session() session: Record<string, any>) {
    if (!body.email || !body.password) {
      throw new HttpException('EMAIL_AND_PASSWORD_REQUIRED', HttpStatus.BAD_REQUEST);
    }
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new HttpException('INVALID_CREDENTIALS', HttpStatus.UNAUTHORIZED);
    }
    session.userId = user.id;
    return { user };
  }

  @Post('logout')
  async logout(@Session() session: Record<string, any>) {
    return new Promise((resolve) => {
      session.destroy?.(() => resolve({ success: true }));
    });
  }

  @Get('me')
  async me(@Session() session: Record<string, any>) {
    if (!session.userId) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    const user = await this.authService.getUserById(session.userId);
    return { user };
  }
}
