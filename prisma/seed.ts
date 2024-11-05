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
    description: "Number of gatepasses to generate per status",
    default: 3,
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
  })
  .option("clear", {
    type: "boolean",
    description: "Clear existing data before seeding",
    default: false,
  }).argv;

const generateGatepassForStatus = (users: any[], status: GatepassStatus) => {
  const createdBy = users[Math.floor(Math.random() * users.length)];
  const updatedBy = users[Math.floor(Math.random() * users.length)];
  const purpose = faker.helpers.arrayElement(Object.values(Purpose));
  const dateIn = faker.date.recent({ days: 30 });

  // Base gatepass data
  const baseData = {
    formNumber: `GP${faker.number.int({ min: 1000, max: 9999 })}`,
    dateIn,
    timeIn: dateIn,
    carrier: faker.company.name(),
    truckLicenseNo: faker.string.alphanumeric(6).toUpperCase(),
    truckNo: `T${faker.number.int({ min: 100, max: 999 })}`,
    trailerLicenseNo: faker.string.alphanumeric(7).toUpperCase(),
    trailerNo: `TR${faker.number.int({ min: 100, max: 999 })}`,
    operatorName: faker.person.fullName(),
    passengerName: Math.random() > 0.7 ? faker.person.fullName() : null,
    purpose,
    remarks: Math.random() > 0.7 ? faker.lorem.sentence() : null,
    securityOfficer: faker.person.fullName(),
    trailerType: faker.helpers.arrayElement([
      "Box",
      "Flatbed",
      "Refrigerated",
      "Container",
    ]),
    destination: faker.location.city(),
    vehicleInspected: faker.datatype.boolean(),
    vestReturned: false,
    status,
    createdBy: { connect: { id: createdBy.id } },
    updatedBy: { connect: { id: updatedBy.id } },
  };

  // Add status-specific data
  switch (status) {
    case GatepassStatus.PENDING:
      return baseData;

    case GatepassStatus.BOL_VERIFIED:
      return {
        ...baseData,
        bolNumber: `BOL${faker.number.int({ min: 10000, max: 99999 })}`,
      };

    case GatepassStatus.CHECKED_IN:
      return {
        ...baseData,
        bolNumber: `BOL${faker.number.int({ min: 10000, max: 99999 })}`,
      };

    case GatepassStatus.IN_YARD:
      return {
        ...baseData,
        bolNumber: `BOL${faker.number.int({ min: 10000, max: 99999 })}`,
        yardCheckinTime: faker.date.recent({ days: 1 }),
      };

    case GatepassStatus.AT_DOOR:
      return {
        ...baseData,
        bolNumber: `BOL${faker.number.int({ min: 10000, max: 99999 })}`,
        yardCheckinTime: faker.date.recent({ days: 1 }),
        pickupDoor: faker.number.int({ min: 1, max: 50 }).toString(),
      };

    case GatepassStatus.LOADING:
      return {
        ...baseData,
        bolNumber: `BOL${faker.number.int({ min: 10000, max: 99999 })}`,
        yardCheckinTime: faker.date.recent({ days: 1 }),
        pickupDoor: faker.number.int({ min: 1, max: 50 }).toString(),
      };

    case GatepassStatus.AWAITING_SEAL:
      return {
        ...baseData,
        bolNumber: `BOL${faker.number.int({ min: 10000, max: 99999 })}`,
        yardCheckinTime: faker.date.recent({ days: 1 }),
        pickupDoor: faker.number.int({ min: 1, max: 50 }).toString(),
      };

    case GatepassStatus.AWAITING_DOCS:
      return {
        ...baseData,
        bolNumber: `BOL${faker.number.int({ min: 10000, max: 99999 })}`,
        yardCheckinTime: faker.date.recent({ days: 1 }),
        pickupDoor: faker.number.int({ min: 1, max: 50 }).toString(),
        sealed: true,
        sealNo1: faker.string.alphanumeric(8).toUpperCase(),
        sealNo2:
          Math.random() > 0.8
            ? faker.string.alphanumeric(8).toUpperCase()
            : null,
      };

    case GatepassStatus.DOCS_TRANSFERRED:
      return {
        ...baseData,
        bolNumber: `BOL${faker.number.int({ min: 10000, max: 99999 })}`,
        yardCheckinTime: faker.date.recent({ days: 1 }),
        pickupDoor: faker.number.int({ min: 1, max: 50 }).toString(),
        sealed: true,
        sealNo1: faker.string.alphanumeric(8).toUpperCase(),
        sealNo2:
          Math.random() > 0.8
            ? faker.string.alphanumeric(8).toUpperCase()
            : null,
        documentsTransferred: true,
        shipperSignature: faker.string.alphanumeric(64),
      };

    case GatepassStatus.COMPLETED:
      return {
        ...baseData,
        bolNumber: `BOL${faker.number.int({ min: 10000, max: 99999 })}`,
        yardCheckinTime: faker.date.recent({ days: 1 }),
        pickupDoor: faker.number.int({ min: 1, max: 50 }).toString(),
        sealed: true,
        sealNo1: faker.string.alphanumeric(8).toUpperCase(),
        sealNo2:
          Math.random() > 0.8
            ? faker.string.alphanumeric(8).toUpperCase()
            : null,
        documentsTransferred: true,
        shipperSignature: faker.string.alphanumeric(64),
        receiverSignature: faker.string.alphanumeric(64),
        releaseRemarks: faker.lorem.sentence(),
        releaseTrailerNo: `RTR${faker.number.int({ min: 100, max: 999 })}`,
        releaseSealNo: faker.string.alphanumeric(8).toUpperCase(),
        vestReturned: true,
      };

    case GatepassStatus.EXITED:
      const exitDate = faker.date.recent({ days: 1 });
      return {
        ...baseData,
        bolNumber: `BOL${faker.number.int({ min: 10000, max: 99999 })}`,
        yardCheckinTime: faker.date.recent({ days: 1 }),
        pickupDoor: faker.number.int({ min: 1, max: 50 }).toString(),
        sealed: true,
        sealNo1: faker.string.alphanumeric(8).toUpperCase(),
        sealNo2:
          Math.random() > 0.8
            ? faker.string.alphanumeric(8).toUpperCase()
            : null,
        documentsTransferred: true,
        shipperSignature: faker.string.alphanumeric(64),
        receiverSignature: faker.string.alphanumeric(64),
        securitySignature: faker.string.alphanumeric(64),
        releaseRemarks: faker.lorem.sentence(),
        releaseTrailerNo: `RTR${faker.number.int({ min: 100, max: 999 })}`,
        releaseSealNo: faker.string.alphanumeric(8).toUpperCase(),
        vestReturned: true,
        dateOut: exitDate,
        timeOut: exitDate,
      };

    case GatepassStatus.CANCELLED:
      return {
        ...baseData,
        remarks: "Cancelled: " + faker.lorem.sentence(),
      };

    default:
      return baseData;
  }
};

// added idempotency
const generateUser = async (role: Role, index: number) => {
  const defaultPassword = (argv as any)["default-password"];
  const saltRounds = (argv as any)["salt-rounds"];
  const hashedPassword = await hash(defaultPassword, saltRounds);

  // Upsert user with given role and index, update password if it differs
  return prisma.user.upsert({
    where: {
      email: `${role.toLowerCase()}${index}@example.com`,
    },
    update: {
      password: hashedPassword, // update password in case it's different
    },
    create: {
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
  const clearDb = (argv as any)["clear"];

  console.log(`
Seeding database with:
- ${userCount} additional users per role
- ${gatepassCount} gatepasses per status (${
    gatepassCount * Object.keys(GatepassStatus).length
  } total)
- Default password: ${defaultPassword}
- Salt rounds: ${(argv as any)["salt-rounds"]}
- Clear database: ${clearDb}
`);

  // Conditional cleanup based on --clear flag
  if (clearDb) {
    console.log("Clearing existing data...");
    await prisma.gatepass.deleteMany();
    await prisma.user.deleteMany();
  } else {
    console.log("Seeding without clearing existing data...");
  }

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

  // Create gatepasses for each status
  const gatepasses = await Promise.all(
    Object.values(GatepassStatus).flatMap((status) =>
      Array(gatepassCount)
        .fill(0)
        .map(() =>
          prisma.gatepass.create({
            data: generateGatepassForStatus(allUsers, status),
          })
        )
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
