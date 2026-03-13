/**
 * Prisma seed script – inserts demo data for development.
 * Run: node backend/shared/prisma/seed.js
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEMO_PRESETS = [
  { name: 'bob-short', description: 'Bob corto, naturale' },
  { name: 'long-waves', description: 'Onde lunghe e naturali' },
  { name: 'pixie', description: 'Pixie cut moderno' },
  { name: 'fade-beard', description: 'Fade e barba curata' },
  { name: 'blonde-balayage', description: 'Balayage biondo caldo' }
];

async function main() {
  console.log('Seeding database...');

  // Upsert a demo client user
  const client = await prisma.user.upsert({
    where: { email: 'demo-client@stayle.beauty' },
    update: {},
    create: {
      email: 'demo-client@stayle.beauty',
      name: 'Demo Client',
      role: 'CLIENT'
    }
  });
  console.log(`  User: ${client.email} (${client.id})`);

  // Upsert a demo professional user
  const proUser = await prisma.user.upsert({
    where: { email: 'demo-pro@stayle.beauty' },
    update: {},
    create: {
      email: 'demo-pro@stayle.beauty',
      name: 'Demo Professional',
      role: 'PROFESSIONAL'
    }
  });

  // Upsert professional profile
  const professional = await prisma.professional.upsert({
    where: { userId: proUser.id },
    update: {},
    create: {
      userId: proUser.id,
      businessName: 'Beauty Studio Demo',
      bio: 'Professional demo account',
      lat: 41.9028,
      lng: 12.4964
    }
  });
  console.log(`  Professional: ${proUser.email} (${professional.id})`);

  // Upsert demo services
  const serviceDefs = [
    { name: 'Taglio capelli', durationMin: 45, price: 35 },
    { name: 'Colore & Balayage', durationMin: 120, price: 90 },
    { name: 'Barba & Rasatura', durationMin: 30, price: 25 }
  ];
  for (const svc of serviceDefs) {
    await prisma.service.create({
      data: { ...svc, professionalId: professional.id }
    }).catch(() => {}); // ignore duplicate
  }

  // Log available presets (stored in service config, not DB)
  console.log('  AI Look Presets (dev config):');
  for (const p of DEMO_PRESETS) {
    console.log(`    - ${p.name}: ${p.description}`);
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
