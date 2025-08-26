import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default permissions
  console.log('📋 Creating permissions...');
  const permissions = [
    // User Management
    { name: 'users.create', module: 'users', action: 'create', description: 'Create new users' },
    { name: 'users.read', module: 'users', action: 'read', description: 'View users' },
    { name: 'users.update', module: 'users', action: 'update', description: 'Update user information' },
    { name: 'users.delete', module: 'users', action: 'delete', description: 'Delete users' },
    { name: 'users.manage', module: 'users', action: 'manage', description: 'Full user management' },

    // Employee Management
    { name: 'employees.create', module: 'employees', action: 'create', description: 'Create new employees' },
    { name: 'employees.read', module: 'employees', action: 'read', description: 'View employee information' },
    { name: 'employees.update', module: 'employees', action: 'update', description: 'Update employee information' },
    { name: 'employees.delete', module: 'employees', action: 'delete', description: 'Delete employees' },
    { name: 'employees.manage', module: 'employees', action: 'manage', description: 'Full employee management' },

    // Attendance Management
    { name: 'attendance.create', module: 'attendance', action: 'create', description: 'Record attendance' },
    { name: 'attendance.read', module: 'attendance', action: 'read', description: 'View attendance records' },
    { name: 'attendance.update', module: 'attendance', action: 'update', description: 'Update attendance records' },
    { name: 'attendance.delete', module: 'attendance', action: 'delete', description: 'Delete attendance records' },
    { name: 'attendance.approve', module: 'attendance', action: 'approve', description: 'Approve attendance records' },
    { name: 'attendance.manage', module: 'attendance', action: 'manage', description: 'Full attendance management' },

    // Leave Management
    { name: 'leaves.create', module: 'leaves', action: 'create', description: 'Create leave requests' },
    { name: 'leaves.read', module: 'leaves', action: 'read', description: 'View leave requests' },
    { name: 'leaves.update', module: 'leaves', action: 'update', description: 'Update leave requests' },
    { name: 'leaves.approve', module: 'leaves', action: 'approve', description: 'Approve/reject leave requests' },
    { name: 'leaves.manage', module: 'leaves', action: 'manage', description: 'Full leave management' },

    // Department Management
    { name: 'departments.create', module: 'departments', action: 'create', description: 'Create departments' },
    { name: 'departments.read', module: 'departments', action: 'read', description: 'View departments' },
    { name: 'departments.update', module: 'departments', action: 'update', description: 'Update departments' },
    { name: 'departments.delete', module: 'departments', action: 'delete', description: 'Delete departments' },
    { name: 'departments.manage', module: 'departments', action: 'manage', description: 'Full department management' },

    // Role Management
    { name: 'roles.create', module: 'roles', action: 'create', description: 'Create custom roles' },
    { name: 'roles.read', module: 'roles', action: 'read', description: 'View roles' },
    { name: 'roles.update', module: 'roles', action: 'update', description: 'Update roles' },
    { name: 'roles.delete', module: 'roles', action: 'delete', description: 'Delete roles' },
    { name: 'roles.assign', module: 'roles', action: 'assign', description: 'Assign roles to users' },
    { name: 'roles.manage', module: 'roles', action: 'manage', description: 'Full role management' },

    // Dashboard & Reports
    { name: 'dashboard.read', module: 'dashboard', action: 'read', description: 'View dashboard' },
    { name: 'reports.create', module: 'reports', action: 'create', description: 'Generate reports' },
    { name: 'reports.read', module: 'reports', action: 'read', description: 'View reports' },
    { name: 'reports.export', module: 'reports', action: 'export', description: 'Export reports' },

    // Company Settings
    { name: 'company.read', module: 'company', action: 'read', description: 'View company information' },
    { name: 'company.update', module: 'company', action: 'update', description: 'Update company settings' },
    { name: 'company.manage', module: 'company', action: 'manage', description: 'Full company management' },
  ];

  for (const permission of permissions) {
    await (prisma as any).permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  // Create Super Admin User
  console.log('👤 Creating Super Admin user...');
  const hashedPassword = await bcrypt.hash('superadmin123', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@ameyasuite.com' },
    update: {},
    create: {
      email: 'superadmin@ameyasuite.com',
      password: hashedPassword,
      name: 'Super Administrator',
      firstName: 'Super',
      lastName: 'Administrator',
      globalRole: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  // Create Demo Company
  console.log('🏢 Creating demo company...');
  const demoCompany = await prisma.company.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Demo Company',
      slug: 'demo-company',
      email: 'contact@democompany.com',
      phone: '+1-555-0123',
      address: '123 Business Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94105',
      subscriptionPlan: 'PRO',
      subscriptionStatus: 'ACTIVE',
      maxUsers: 50,
      settings: {
        workingHours: {
          start: '09:00',
          end: '18:00',
        },
        workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        timezone: 'America/Los_Angeles',
      },
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📝 Demo Credentials:');
  console.log('Super Admin: superadmin@ameyasuite.com / superadmin123');
  console.log('Company Slug: demo-company');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
