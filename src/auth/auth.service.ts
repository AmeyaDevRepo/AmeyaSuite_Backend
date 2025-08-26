import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

function sanitizeUser(user: any) {
    if (!user) return null;
    const { password, passwordResetToken, passwordResetExpires, emailVerificationToken, ...rest } = user;
    return rest;
}

@Injectable()
export class AuthService {
    private readonly saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    private readonly logger = new Logger(AuthService.name);
    constructor(private readonly prisma: PrismaService) { }

        async signup(data: { email: string; password: string; name?: string; firstName?: string; lastName?: string }) {
        try {
        const existing = await this.prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
            if (existing) throw new Error('EMAIL_IN_USE');
            const hash = await bcrypt.hash(data.password, this.saltRounds);
                // Derive first/last name
                let firstName = data.firstName;
                let lastName = data.lastName;
                if (!firstName && !lastName && data.name) {
                    const parts = data.name.trim().split(/\s+/);
                    firstName = parts.shift();
                    lastName = parts.length ? parts.join(' ') : undefined;
                }
        const user = await this.prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                password: hash,
                firstName: firstName,
                lastName: lastName,
            }
        });
            return sanitizeUser(user);
        } catch (e: any) {
            this.logger.error('Signup failed', e?.stack || e);
            throw e;
        }
    }

    async validateUser(email: string, password: string) {
        try {
            const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
            if (!user || !user.password) return null;
            const match = await bcrypt.compare(password, user.password);
            if (!match) return null;
            return sanitizeUser(user);
        } catch (e: any) {
            this.logger.error('validateUser failed', e?.stack || e);
            // Fallback: if email is not actually unique in DB, use findFirst
            try {
                const user = await this.prisma.user.findFirst({ where: { email: email.toLowerCase() } });
                if (!user || !user.password) return null;
                const match = await bcrypt.compare(password, user.password);
                if (!match) return null;
                return sanitizeUser(user);
            } catch (inner) {
                this.logger.error('Fallback validateUser failed', (inner as any)?.stack || inner);
                return null;
            }
        }
    }

    async getUserById(id: string) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id } });
            return sanitizeUser(user);
        } catch (e: any) {
            this.logger.error('getUserById failed', e?.stack || e);
            return null;
        }
    }
}
