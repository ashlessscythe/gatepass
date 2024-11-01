import { PrismaClient, Role, GatepassStatus, Purpose } from "@prisma/client";
import { hash } from "bcryptjs";
import { faker } from "@faker-js/faker";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const prisma = new PrismaClient();

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option("gatepass-count", {
    alias: "g",
    type: "number",
    description: "Number of gatepasses to generate",
    default: 10,
  })
  .option("user-count", {
    alias: "u",
    type: "number",
    description: "Number of additional users to generate per role",
    default: 2,
  })
  .option("default-password", {
    alias: "p",
    type: "string",
    description: "Default password for generated users",
    default: process.env.SEED_DEFAULT_PASSWORD || "changeme123",
  })
  .option("salt-rounds", {
    alias: "s",
    type: "number",
    description: "Number of salt rounds for password hashing",
    default: 12,
  }).argv;

const generateRandomGatepass = (users: any[]) => {
  const createdBy = users[Math.floor(Math.random() * users.length)];
  const updatedBy =
    Math.random() > 0.5
      ? users[Math.floor(Math.random() * users.length)]
      : null;
  const status = faker.helpers.arrayElement(Object.values(GatepassStatus));
  const purpose = faker.helpers.arrayElement(Object.values(Purpose));
  const sealed = faker.datatype.boolean();

  return {
    formNumber: `GP${faker.number.int({ min: 1000, max: 9999 })}`,
    dateIn: faker.date.recent({ days: 30 }),
    timeIn: faker.date.recent({ days: 30 }),
    dateOut:
      status === GatepassStatus.COMPLETED
        ? faker.date.recent({ days: 1 })
        : null,
    timeOut:
      status === GatepassStatus.COMPLETED
        ? faker.date.recent({ days: 1 })
        : null,
    carrier: faker.company.name(),
    truckLicenseNo: faker.string.alphanumeric(6).toUpperCase(),
    truckNo: `T${faker.number.int({ min: 100, max: 999 })}`,
    trailerLicenseNo: faker.string.alphanumeric(7).toUpperCase(),
    trailerNo: `TR${faker.number.int({ min: 100, max: 999 })}`,
    operatorName: faker.person.fullName(),
    passengerName: Math.random() > 0.7 ? faker.person.fullName() : null,
    purpose,
    sealed,
    sealNo1: sealed ? faker.string.alphanumeric(8).toUpperCase() : null,
    sealNo2:
      sealed && Math.random() > 0.8
        ? faker.string.alphanumeric(8).toUpperCase()
        : null,
    remarks: Math.random() > 0.7 ? faker.lorem.sentence() : null,
    securityOfficer: faker.person.fullName(),
    releaseRemarks:
      status === GatepassStatus.COMPLETED ? faker.lorem.sentence() : null,
    trailerType: faker.helpers.arrayElement([
      "Box",
      "Flatbed",
      "Refrigerated",
      "Container",
    ]),
    releaseTrailerNo:
      status === GatepassStatus.COMPLETED
        ? `RTR${faker.number.int({ min: 100, max: 999 })}`
        : null,
    destination: faker.location.city(),
    vehicleInspected: faker.datatype.boolean(),
    releaseSealNo:
      status === GatepassStatus.COMPLETED
        ? faker.string.alphanumeric(8).toUpperCase()
        : null,
    vestReturned:
      status === GatepassStatus.COMPLETED ? true : faker.datatype.boolean(),
    receiverSignature:
      status === GatepassStatus.COMPLETED
        ? faker.string.alphanumeric(64)
        : null,
    shipperSignature:
      status === GatepassStatus.COMPLETED
        ? faker.string.alphanumeric(64)
        : null,
    securitySignature:
      status === GatepassStatus.COMPLETED
        ? faker.string.alphanumeric(64)
        : null,
    status,
    bolNumber:
      status !== GatepassStatus.PENDING
        ? `BOL${faker.number.int({ min: 10000, max: 99999 })}`
        : null,
    pickupDoor:
      status === GatepassStatus.IN_YARD
        ? faker.number.int({ min: 1, max: 50 }).toString()
        : null,
    yardCheckinTime:
      status === GatepassStatus.IN_YARD ? faker.date.recent({ days: 1 }) : null,
    createdBy: {
      connect: {
        id: createdBy.id,
      },
    },
    updatedBy: updatedBy
      ? {
          connect: {
            id: updatedBy.id,
          },
        }
      : undefined,
  };
};

const generateUser = async (role: Role, index: number) => {
  const defaultPassword = (argv as any)["default-password"];
  const saltRounds = (argv as any)["salt-rounds"];
  const hashedPassword = await hash(defaultPassword, saltRounds);

  return prisma.user.create({
    data: {
      email: `${role.toLowerCase()}${index}@example.com`,
      name: faker.person.fullName(),
      role,
      password: hashedPassword,
    },
  });
};

async function main() {
  const gatepassCount = (argv as any)["gatepass-count"];
  const userCount = (argv as any)["user-count"];
  const defaultPassword = (argv as any)["default-password"];

  console.log(`
Seeding database with:
- ${userCount} additional users per role
- ${gatepassCount} gatepasses
- Default password: ${defaultPassword}
- Salt rounds: ${(argv as any)["salt-rounds"]}
`);

  // Clean up existing data
  await prisma.gatepass.deleteMany();
  await prisma.user.deleteMany();

  // Create default users
  const defaultUsers = await Promise.all([
    generateUser(Role.ADMIN, 0),
    generateUser(Role.GUARD, 0),
    generateUser(Role.DISPATCH, 0),
    generateUser(Role.WAREHOUSE, 0),
  ]);

  // Create additional users for each role
  const additionalUsers = await Promise.all([
    ...Array(userCount)
      .fill(0)
      .map((_, i) => generateUser(Role.ADMIN, i + 1)),
    ...Array(userCount)
      .fill(0)
      .map((_, i) => generateUser(Role.GUARD, i + 1)),
    ...Array(userCount)
      .fill(0)
      .map((_, i) => generateUser(Role.DISPATCH, i + 1)),
    ...Array(userCount)
      .fill(0)
      .map((_, i) => generateUser(Role.WAREHOUSE, i + 1)),
  ]);

  const allUsers = [...defaultUsers, ...additionalUsers];

  // Create gatepasses
  const gatepasses = await Promise.all(
    Array(gatepassCount)
      .fill(0)
      .map(() =>
        prisma.gatepass.create({ data: generateRandomGatepass(allUsers) })
      )
  );

  console.log(
    `Created ${allUsers.length} users and ${gatepasses.length} gatepasses`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
