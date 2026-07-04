import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const demoPassword = await bcrypt.hash('Demo@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@agristack.in' },
    update: {
      paymentStatus: 'PAID',
      subscriptionType: 'ONE_TIME',
    },
    create: {
      name: 'Admin',
      email: 'admin@agristack.in',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      paymentStatus: 'PAID',
      subscriptionType: 'ONE_TIME',
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: 'demo@agristack.in' },
    update: {
      paymentStatus: 'PAID',
      subscriptionType: 'ONE_TIME',
    },
    create: {
      name: 'Demo User',
      email: 'demo@agristack.in',
      password: demoPassword,
      role: 'USER',
      emailVerified: true,
      paymentStatus: 'PAID',
      subscriptionType: 'ONE_TIME',
    },
  });

  console.log('✅ Seed completed:');
  console.log(`   Admin user: ${admin.email} (id: ${admin.id})`);
  console.log(`   Demo user:  ${demo.email} (id: ${demo.id})`);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
