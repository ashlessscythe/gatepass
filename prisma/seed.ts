const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const password = await hash("password123", 12);

  // Create users for each role
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        email: "admin@example.com",
        name: "Admin User",
        password,
        role: "ADMIN",
      },
    }),
    prisma.user.upsert({
      where: { email: "guard@example.com" },
      update: {},
      create: {
        email: "guard@example.com",
        name: "Security Guard",
        password,
        role: "GUARD",
      },
    }),
    prisma.user.upsert({
      where: { email: "dispatch@example.com" },
      update: {},
      create: {
        email: "dispatch@example.com",
        name: "Dispatch Officer",
        password,
        role: "DISPATCH",
      },
    }),
    prisma.user.upsert({
      where: { email: "warehouse@example.com" },
      update: {},
      create: {
        email: "warehouse@example.com",
        name: "Warehouse Manager",
        password,
        role: "WAREHOUSE",
      },
    }),
  ]);

  console.log("Seeded users:", users);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
