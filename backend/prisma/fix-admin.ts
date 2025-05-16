import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Deleting existing admin user...');
    await prisma.user.deleteMany({
      where: {
        email: 'admin@admin.com'
      }
    });

    console.log('Creating new admin user...');
    const adminUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: 'admin@admin.com',
        password: await bcrypt.hash('admin', 10),
        role: 'ADMIN'
      }
    });

    console.log('Admin user created successfully with ID:', adminUser.id);
  } catch (error) {
    console.error('Error fixing admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 