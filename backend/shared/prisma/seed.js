const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed StylePresets
  const presets = [
    { name: 'natural', label: 'Natural', description: 'Everyday fresh look', prompt: 'natural everyday makeup, dewy skin, soft colors', sortOrder: 1, previewUrl: 'https://cdn.beautyapp.com/presets/natural.jpg' },
    { name: 'glam', label: 'Glam', description: 'Dramatic glamour look', prompt: 'glamorous makeup, bold lips, dramatic eyes, high fashion', sortOrder: 2, previewUrl: 'https://cdn.beautyapp.com/presets/glam.jpg' },
    { name: 'editorial', label: 'Editorial', description: 'Magazine-worthy artistry', prompt: 'editorial avant-garde makeup, artistic, magazine cover', sortOrder: 3, previewUrl: 'https://cdn.beautyapp.com/presets/editorial.jpg' },
    { name: 'bridal', label: 'Bridal', description: 'Elegant wedding look', prompt: 'elegant bridal makeup, soft romantic, flawless skin', sortOrder: 4, previewUrl: 'https://cdn.beautyapp.com/presets/bridal.jpg' },
    { name: 'smoky', label: 'Smoky Eye', description: 'Sultry smoky eye effect', prompt: 'smoky eye makeup, sultry dramatic, professional quality', sortOrder: 5, previewUrl: 'https://cdn.beautyapp.com/presets/smoky.jpg' },
  ];

  for (const preset of presets) {
    await prisma.stylePreset.upsert({
      where: { name: preset.name },
      update: preset,
      create: preset,
    });
    console.log(`  ✓ Preset: ${preset.label}`);
  }

  // Seed demo users
  const demoClient = await prisma.user.upsert({
    where: { email: 'demo.client@beautyapp.com' },
    update: {},
    create: {
      email: 'demo.client@beautyapp.com',
      fullName: 'Demo Client',
      role: 'CLIENT',
      avatarUrl: 'https://cdn.beautyapp.com/avatars/demo-client.jpg',
    },
  });
  console.log(`  ✓ User: ${demoClient.fullName}`);

  const demoPro = await prisma.user.upsert({
    where: { email: 'demo.pro@beautyapp.com' },
    update: {},
    create: {
      email: 'demo.pro@beautyapp.com',
      fullName: 'Demo Professional',
      role: 'PROFESSIONAL',
      avatarUrl: 'https://cdn.beautyapp.com/avatars/demo-pro.jpg',
    },
  });
  console.log(`  ✓ User: ${demoPro.fullName}`);

  // Seed professional profile
  await prisma.professional.upsert({
    where: { userId: demoPro.id },
    update: {},
    create: {
      userId: demoPro.id,
      bio: 'Award-winning makeup artist with 10+ years experience.',
      specialties: ['bridal', 'editorial', 'special-effects'],
      rating: 4.9,
      location: { lat: 41.9028, lng: 12.4964, address: 'Rome, Italy' },
      whatsapp: '+39123456789',
    },
  });
  console.log(`  ✓ Professional profile for ${demoPro.fullName}`);

  // Seed a demo generated look
  await prisma.generatedLook.upsert({
    where: { jobId: 'demo-job-001' },
    update: {},
    create: {
      userId: demoClient.id,
      jobId: 'demo-job-001',
      resultUrl: 'https://cdn.beautyapp.com/results/demo-glam-result.jpg',
      resultUrls: JSON.stringify(['https://cdn.beautyapp.com/results/demo-glam-result.jpg']),
      preset: 'glam',
      metadata: JSON.stringify({ provider: 'demo', styleOptions: {} }),
      status: 'completed',
    },
  });
  console.log('  ✓ Demo generated look');

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
