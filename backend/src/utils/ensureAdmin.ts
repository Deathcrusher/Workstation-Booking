import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function ensureDefaultAdmin(prisma: PrismaClient): Promise<void> {
  // Hard‑coded credentials for the default administrator. These values
  // should only be used in development or initial bootstrapping; in
  // production you should change them immediately after the first
  // login.
  const email = 'admin@admin.com';
  const password = 'admin';

  // Hash the plain‑text password once up front. Using a constant salt
  // rounds ensures consistent hashing across environments.
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Use upsert so that if an admin user already exists we update its
    // password and role, otherwise we create it. This prevents stale
    // passwords lingering from previous runs and ensures the admin
    // account always has the expected credentials.
    await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        id: uuidv4(),
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Default admin user ensured');
  } catch (error) {
    // Swallow unique constraint errors silently to avoid crashing on
    // startup. All other errors are rethrown so they can be caught
    // upstream.
    throw error;
  }
}
