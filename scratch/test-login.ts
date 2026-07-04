import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function test() {
  console.log('--- Testing admin@agristack.in login ---');
  const user = await prisma.user.findUnique({ where: { email: 'admin@agristack.in' } });
  if (!user) {
    console.error('User admin@agristack.in not found in database!');
    return;
  }

  console.log(`User found: ${user.name} (${user.email})`);
  console.log(`Stored password hash: ${user.password}`);

  const testPassword = 'Admin@123';
  const match = await bcrypt.compare(testPassword, user.password!);
  console.log(`Bcrypt compare for '${testPassword}': ${match}`);

  const testDemo = 'Demo@123';
  const demoUser = await prisma.user.findUnique({ where: { email: 'demo@agristack.in' } });
  if (demoUser) {
    console.log(`Demo stored password hash: ${demoUser.password}`);
    const demoMatch = await bcrypt.compare(testDemo, demoUser.password!);
    console.log(`Bcrypt compare for '${testDemo}': ${demoMatch}`);
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
