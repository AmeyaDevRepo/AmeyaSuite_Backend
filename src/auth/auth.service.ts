import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

function sanitizeUser(user: any) {
    if (!user) return null;
    const { password, passwordResetToken, passwordResetExpires, emailVerificationToken, ...rest } = user;
    return rest;
}

interface CompanySignupData {
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

@Injectable()
export class AuthService {
    private readonly saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    private readonly logger = new Logger(AuthService.name);
    constructor(private readonly prisma: PrismaService) { }

    async companySignup(data: CompanySignupData) {
        try {
            // Check if user already exists
            const existingUser = await this.prisma.user.findUnique({ 
                where: { email: data.email.toLowerCase() } 
            });
            if (existingUser) throw new Error('EMAIL_IN_USE');

            // Check if company name is already taken
            const existingCompany = await this.prisma.company.findFirst({
                where: { name: data.companyName.trim() }
            });
            if (existingCompany) throw new Error('COMPANY_NAME_TAKEN');

            // Hash password
            const hash = await bcrypt.hash(data.password, this.saltRounds);

            // Derive first/last name
            let firstName = data.firstName;
            let lastName = data.lastName;
            if (!firstName && !lastName && data.name) {
                const parts = data.name.trim().split(/\s+/);
                firstName = parts.shift();
                lastName = parts.length ? parts.join(' ') : undefined;
            }

            // Create slug for company
            const slug = data.companyName.toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

            // Start transaction for atomicity
            const result = await this.prisma.$transaction(async (tx) => {
                // 1. Create User
                const user = await tx.user.create({
                    data: {
                        email: data.email.toLowerCase(),
                        password: hash,
                    }
                });

                // 2. Create Company
                const company = await tx.company.create({
                    data: {
                        name: data.companyName.trim(),
                        slug: slug,
                        themeColor: data.themeColor || '#004aad',
                        phone: data.phone,
                        email: data.companyEmail || data.email,
                        address: data.address,
                        city: data.city,
                        state: data.state,
                        zipCode: data.zipCode,
                    }
                });

                // 3. Create default company roles
                let adminRole, managerRole, userRole;
                
                try {
                    // Create Admin role
                    adminRole = await tx.companyRole.create({
                        data: {
                            name: 'Admin',
                            description: 'Full administrative access to the company',
                            color: '#ef4444',
                            companyId: company.id,
                            permissions: ['*'], // Full permissions
                        }
                    });
                    
                    // Create Manager role
                    managerRole = await tx.companyRole.create({
                        data: {
                            name: 'Manager',
                            description: 'Management level access',
                            color: '#f59e0b',
                            companyId: company.id,
                            permissions: ['read', 'write', 'manage_team'],
                        }
                    });
                    
                    // Create User role
                    userRole = await tx.companyRole.create({
                        data: {
                            name: 'User',
                            description: 'Standard user access',
                            color: '#10b981',
                            companyId: company.id,
                            permissions: ['read', 'write'],
                        }
                    });
                    
                } catch (error: any) {
                    this.logger.error('Failed to create company roles', error);
                    
                    // Check if it's a unique constraint violation
                    if (error.code === 'P2002') {
                        throw new Error(`ROLE_CREATION_FAILED: Role names must be unique within company. ${error.meta?.target || ''}`);
                    }
                    
                    throw new Error(`ROLE_CREATION_FAILED: ${error.message || 'Unknown error creating roles'}`);
                }

                // 4. Create CompanyUser with Admin role for the creator
                const companyUser = await tx.companyUser.create({
                    data: {
                        userId: user.id,
                        companyId: company.id,
                        firstName: firstName,
                        lastName: lastName,
                        status: 'ACTIVE',
                        isActive: true,
                        joinedAt: new Date(),
                    }
                });

                return {
                    user: sanitizeUser(user),
                    company,
                    companyUser,
                    roles: { admin: adminRole, manager: managerRole, user: userRole }
                };
            });

            return result;
        } catch (e: any) {
            this.logger.error('Company signup failed', e?.stack || e);
            throw e;
        }
    }

    async validateUser(email: string, password: string) {
        try {
            const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
            if (!user || !user.password) return null;
            const match = await bcrypt.compare(password, user.password);
            if (!match) return null;

            // Fetch user's company (via companyUser) to get themeColor
            const companyUser = await this.prisma.companyUser.findFirst({
                where: { userId: user.id, isActive: true },
                include: { company: true }
            });
            const themeColor = companyUser?.company?.themeColor;

            return { ...sanitizeUser(user), themeColor };
        } catch (e: any) {
            this.logger.error('validateUser failed', e?.stack || e);
            // Fallback: if email is not actually unique in DB, use findFirst
            try {
                const user = await this.prisma.user.findFirst({ where: { email: email.toLowerCase() } });
                if (!user || !user.password) return null;
                const match = await bcrypt.compare(password, user.password);
                if (!match) return null;

                const companyUser = await this.prisma.companyUser.findFirst({
                    where: { userId: user.id, isActive: true },
                    include: { company: true }
                });
                const themeColor = companyUser?.company?.themeColor;

                return { ...sanitizeUser(user), themeColor };
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
