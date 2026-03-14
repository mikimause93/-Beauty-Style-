const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PRESETS = [
  { name: 'bob-short', description: 'Bob corto, naturale' },
  { name: 'long-waves', description: 'Onde lunghe e naturali' },
  { name: 'pixie', description: 'Pixie cut moderno' },
  { name: 'fade-beard', description: 'Fade e barba curata' },
  { name: 'blonde-balayage', description: 'Balayage biondo caldo' }
];

async function main() {
  console.log('Seeding AI Look presets (dev only):');
  PRESETS.forEach(p => console.log(` - ${p.name}: ${p.description}`));
  // Extend this function to upsert presets into a dedicated DB table when ready.
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
