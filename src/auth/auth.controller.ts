import { Controller, Post, Body, Session, Get, HttpException, HttpStatus, Res, Req } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

interface SignupDto { email: string; password: string; firstName?: string; lastName?: string; name?: string }
interface LoginDto { email: string; password: string }

interface CompanySignupDto {
    // User data
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    
    // Company data
    companyName: string;
    themeColor?: string;
    phone?: string;
    companyEmail?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private serializeUser(u: any, companyData?: any) {
    if (!u) return null;
    // Provide a unified 'name' field for frontend (falls back gracefully)
    const name = u.firstName || u.lastName ? [u.firstName, u.lastName].filter(Boolean).join(' ') : (u.name || null);
    const baseUser = { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, name };
    
    if (companyData) {
      return {
        ...baseUser,
        company: {
          id: companyData.id,
          name: companyData.name,
          slug: companyData.slug,
          themeColor: companyData.themeColor,
        }
      };
    }
    
    return baseUser;
  }

  @Post('company-signup')
  async companySignup(@Body() body: CompanySignupDto, @Session() session: Record<string, any>, @Req() req: any) {
    // Validate required fields
    if (!body.email || !body.password || !body.companyName) {
      throw new HttpException('EMAIL_PASSWORD_AND_COMPANY_NAME_REQUIRED', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.authService.companySignup(body);
      const serialized = this.serializeUser(result.user, result.company);
      
      session.userId = result.user.id;
      session.user = serialized;
      session.companyId = result.company.id;
      req.user = serialized;
      
      return { 
        user: serialized,
        company: result.company,
        success: true,
        message: 'Company and admin user created successfully'
      };
    } catch (e: any) {
      if (e.message === 'EMAIL_IN_USE') {
        throw new HttpException('EMAIL_IN_USE', HttpStatus.CONFLICT);
      }
      if (e.message === 'COMPANY_NAME_TAKEN') {
        throw new HttpException('COMPANY_NAME_TAKEN', HttpStatus.CONFLICT);
      }
      if (e.message?.startsWith('ROLE_CREATION_FAILED')) {
        throw new HttpException('ROLE_CREATION_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      const isProd = process.env.NODE_ENV === 'production';
      if (isProd) {
        throw new HttpException('INTERNAL_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      throw new HttpException({
        error: 'COMPANY_SIGNUP_FAILED',
        message: e?.message || 'Unknown error',
        detail: e?.code || undefined,
        stack: (e?.stack ? e.stack.split('\n').slice(0,4).join('\n') : undefined)
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
