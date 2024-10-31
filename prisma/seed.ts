import { PrismaClient, Role, Status } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const password = await hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password,
      role: Role.ADMIN,
    },
  });

  const guard = await prisma.user.upsert({
    where: { email: "guard@example.com" },
    update: {},
    create: {
      email: "guard@example.com",
      name: "Security Guard",
      password,
      role: Role.GUARD,
    },
  });

  // Create test gatepasses
  const now = new Date();

  // Pending gatepass
  await prisma.gatepass.create({
    data: {
      formNumber: "ABC123",
      dateIn: now,
      timeIn: now,
      carrier: "Test Carrier 1",
      truckLicenseNo: "TL123",
      truckNo: "T001",
      operatorName: "John Doe",
      purpose: "PICKUP",
      sealed: false,
      securityOfficer: "Guard 1",
      status: Status.PENDING,
      vehicleInspected: false,
      vestReturned: false,
      createdBy: {
        connect: {
          id: guard.id,
        },
      },
    },
  });

  // In Progress gatepass
  await prisma.gatepass.create({
    data: {
      formNumber: "DEF456",
      dateIn: now,
      timeIn: now,
      carrier: "Test Carrier 2",
      truckLicenseNo: "TL456",
      truckNo: "T002",
      operatorName: "Jane Smith",
      purpose: "DELIVER",
      sealed: true,
      sealNo1: "S123",
      securityOfficer: "Guard 1",
      status: Status.IN_PROGRESS,
      vehicleInspected: true,
      vestReturned: false,
      createdBy: {
        connect: {
          id: guard.id,
        },
      },
    },
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
