const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const user = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: { 
        password: hashedPassword,
        role: 'ADMIN'
      },
      create: {
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('Admin user created or updated:', user);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 