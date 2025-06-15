import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function ensureDefaultAdmin(prisma: PrismaClient): Promise<void> {
  const email = 'admin@admin.com';
  const password = 'admin';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        password: await bcrypt.hash(password, 10),
        role: 'ADMIN'
      }
    });
    console.log('Default admin user created');
  }
}
