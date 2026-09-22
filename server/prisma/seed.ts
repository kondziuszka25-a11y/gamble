import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database reset and seed...');

  // Clean all existing tables
  await prisma.adminLog.deleteMany();
  await prisma.dailyRewardClaim.deleteMany();
  await prisma.gameHistory.deleteMany();
  await prisma.collectibleItem.deleteMany();
  await prisma.ownedBoost.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create ONLY Owner user: kondom / Kondzio25! with starting coins (1000) and gems (5)
  const ownerPasswordHash = await bcrypt.hash('Kondzio25!', 12);

  const owner = await prisma.user.create({
    data: {
      username: 'kondom',
      email: 'kondom@jackpot.gg',
      passwordHash: ownerPasswordHash,
      role: 'OWNER',
      level: 1,
      xp: 0,
      xpRequired: 1000,
      coins: 1000,
      gems: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      status: 'ACTIVE',
      online: false,
    },
  });

  // Create initial Admin log
  await prisma.adminLog.create({
    data: {
      adminId: owner.id,
      action: 'Inicjalizacja systemu',
      value: 'Reset bazy danych',
      reason: 'Konto właściciela (kondom) utworzone z saldem startowym (1000 monet, 5 gemów), puste inventory',
    },
  });

  console.log('✅ Database reset complete!');
  console.log('👑 Owner Account:');
  console.log('   Username: kondom');
  console.log('   Password: Kondzio25!');
  console.log('   Role: OWNER');
  console.log('   Coins: 1000 | Gems: 5');
  console.log('   Inventory: PUSTE');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
