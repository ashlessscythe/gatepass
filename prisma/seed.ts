import { PrismaClient, Role, GatepassStatus, Purpose } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.gatepass.deleteMany();
  await prisma.user.deleteMany();

  // Hash default password
  const hashedPassword = await hash("password123", 10);

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      role: Role.ADMIN,
      password: hashedPassword,
    },
  });

  const guard = await prisma.user.upsert({
    where: { email: "guard@example.com" },
    update: {},
    create: {
      email: "guard@example.com",
      name: "Guard User",
      role: Role.GUARD,
      password: hashedPassword,
    },
  });

  const dispatch = await prisma.user.upsert({
    where: { email: "dispatch@example.com" },
    update: {},
    create: {
      email: "dispatch@example.com",
      name: "Dispatch User",
      role: Role.DISPATCH,
      password: hashedPassword,
    },
  });

  const warehouse = await prisma.user.upsert({
    where: { email: "warehouse@example.com" },
    update: {},
    create: {
      email: "warehouse@example.com",
      name: "Warehouse User",
      role: Role.WAREHOUSE,
      password: hashedPassword,
    },
  });

  // Create sample gatepasses
  const gatepass1 = await prisma.gatepass.create({
    data: {
      formNumber: "GP001",
      dateIn: new Date(),
      timeIn: new Date(),
      carrier: "ABC Logistics",
      truckLicenseNo: "ABC123",
      truckNo: "T001",
      operatorName: "John Doe",
      purpose: Purpose.PICKUP,
      sealed: false,
      securityOfficer: "Guard User",
      vehicleInspected: true,
      vestReturned: false,
      status: GatepassStatus.PENDING,
      createdById: guard.id,
    },
  });

  const gatepass2 = await prisma.gatepass.create({
    data: {
      formNumber: "GP002",
      dateIn: new Date(),
      timeIn: new Date(),
      carrier: "XYZ Transport",
      truckLicenseNo: "XYZ789",
      truckNo: "T002",
      operatorName: "Jane Smith",
      purpose: Purpose.DELIVER,
      sealed: true,
      sealNo1: "S001",
      securityOfficer: "Guard User",
      vehicleInspected: true,
      vestReturned: false,
      status: GatepassStatus.BOL_VERIFIED,
      createdById: guard.id,
      updatedById: dispatch.id,
      bolNumber: "BOL123",
    },
  });

  const gatepass3 = await prisma.gatepass.create({
    data: {
      formNumber: "GP003",
      dateIn: new Date(),
      timeIn: new Date(),
      carrier: "Fast Freight",
      truckLicenseNo: "FF456",
      truckNo: "T003",
      operatorName: "Bob Wilson",
      purpose: Purpose.PICKUP,
      sealed: false,
      securityOfficer: "Guard User",
      vehicleInspected: true,
      vestReturned: false,
      status: GatepassStatus.IN_YARD,
      createdById: guard.id,
      updatedById: dispatch.id,
      bolNumber: "BOL456",
      pickupDoor: "12",
      yardCheckinTime: new Date(),
    },
  });

  console.log({
    admin,
    guard,
    dispatch,
    warehouse,
    gatepass1,
    gatepass2,
    gatepass3,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
