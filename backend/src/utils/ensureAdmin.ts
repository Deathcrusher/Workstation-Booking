import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function ensureDefaultAdmin(prisma: PrismaClient): Promise<void> {
  /*
   * Determine the credentials for the bootstrap administrator. In production,
   * these should be provided via environment variables to avoid using
   * predictable defaults. If the environment variables are absent, fall
   * back to sensible defaults. See `README.md` for deployment guidance.
   */
  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@admin.com';
  const plaintextPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';

  // Hash the plain‑text password once up front. Using a constant salt
  // rounds ensures consistent hashing across environments.
  const hashedPassword = await bcrypt.hash(plaintextPassword, 10);

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
    // Re-throw errors so that upstream callers can decide how to handle them.
    throw error;
  }
}
