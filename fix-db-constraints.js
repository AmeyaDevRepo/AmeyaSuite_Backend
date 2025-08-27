const { PrismaClient } = require('@prisma/client');

async function fixConstraints() {
    const prisma = new PrismaClient();
    
    try {
        // Check if there are any existing companies and roles
        const companies = await prisma.company.findMany({
            include: {
                companyRoles: true
            }
        });
        
        console.log('Existing companies:', companies.length);
        
        // If there are companies with conflicting roles, we need to clean them up
        for (const company of companies) {
            console.log(`Company: ${company.name}, Roles: ${company.companyRoles.length}`);
            
            // Delete existing roles for this company to start fresh
            await prisma.companyRole.deleteMany({
                where: {
                    companyId: company.id
                }
            });
            
            console.log(`Deleted existing roles for company: ${company.name}`);
        }
        
        console.log('Database constraints should now be clean');
        
    } catch (error) {
        console.error('Error fixing constraints:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixConstraints();
