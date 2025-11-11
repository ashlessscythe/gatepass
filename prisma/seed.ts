import { PrismaClient, Role, GatepassStatus, Purpose } from "@prisma/client";
import { hash } from "bcryptjs";
import { faker } from "@faker-js/faker";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const prisma = new PrismaClient();

const generateGatepassForStatus = (
  users: any[],
  status: GatepassStatus,
  formNumberGenerator: () => string
) => {
  const createdBy = users[Math.floor(Math.random() * users.length)];
  const updatedBy = users[Math.floor(Math.random() * users.length)];
  const purpose = faker.helpers.arrayElement(Object.values(Purpose));
  const dateIn = faker.date.recent({ days: 30 });

  // Base gatepass data
  const baseData = {
    formNumber: formNumberGenerator(),
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

    case GatepassStatus.AT_DOOR:
      return {
        ...baseData,
        bolNumber: `BOL${faker.number.int({ min: 10000, max: 99999 })}`,
        pickupDoor: faker.number.int({ min: 1, max: 50 }).toString(),
      };

    case GatepassStatus.LOADING:
      return {
        ...baseData,
        bolNumber: `BOL${faker.number.int({ min: 10000, max: 99999 })}`,
        pickupDoor: faker.number.int({ min: 1, max: 50 }).toString(),
      };

    case GatepassStatus.AWAITING_DOCS:
      return {
        ...baseData,
        bolNumber: `BOL${faker.number.int({ min: 10000, max: 99999 })}`,
        pickupDoor: faker.number.int({ min: 1, max: 50 }).toString(),
        sealed: true,
        sealNo1: faker.string.alphanumeric(8).toUpperCase(),
        sealNo2:
          Math.random() > 0.8
            ? faker.string.alphanumeric(8).toUpperCase()
            : null,
      };

    case GatepassStatus.COMPLETED:
      return {
        ...baseData,
        bolNumber: `BOL${faker.number.int({ min: 10000, max: 99999 })}`,
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
const generateUser = async (
  role: Role,
  index: number,
  defaultPassword: string,
  saltRounds: number
) => {
  if (!defaultPassword || defaultPassword.trim() === "") {
    throw new Error("Default password cannot be empty");
  }

  const hashedPassword = await hash(defaultPassword, saltRounds);
  const email = `${role.toLowerCase()}${index}@example.com`;

  // Upsert user with given role and index, update password if it differs
  const user = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      password: hashedPassword, // update password in case it's different
    },
    create: {
      email,
      name: faker.person.fullName(),
      role,
      password: hashedPassword,
    },
  });

  console.log(`✓ ${role} user ${index}: ${email}`);
  return user;
};

async function main() {
  // Parse command line arguments
  const argv = await yargs(hideBin(process.argv))
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
      default: process.env.SEED_DEFAULT_PASSWORD || "bobspass",
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
    })
    .parse();

  const gatepassCount = argv["gatepass-count"] as number;
  const userCount = argv["user-count"] as number;
  const defaultPassword = argv["default-password"] as string;
  const saltRounds = argv["salt-rounds"] as number;
  const clearDb = argv["clear"] as boolean;

  // Validate default password
  if (!defaultPassword || defaultPassword.trim() === "") {
    throw new Error(
      "Default password cannot be empty. Set SEED_DEFAULT_PASSWORD env var or use --default-password flag."
    );
  }

  // Calculate varied gatepass counts per status
  // Some statuses are more common in real scenarios
  const statusCounts: Record<GatepassStatus, number> = {} as Record<
    GatepassStatus,
    number
  >;
  let totalGatepasses = 0;

  for (const status of Object.values(GatepassStatus)) {
    // Base variation: ±30% of the target count
    const variation = 0.3;
    const minCount = Math.max(1, Math.floor(gatepassCount * (1 - variation)));
    const maxCount = Math.ceil(gatepassCount * (1 + variation));

    // Apply status-specific multipliers for more realistic distribution
    let multiplier = 1.0;
    switch (status) {
      case GatepassStatus.PENDING:
        // PENDING is common - slightly above average
        multiplier = 1.1;
        break;
      case GatepassStatus.EXITED:
        // EXITED might be less common (some get cancelled)
        multiplier = 0.9;
        break;
      case GatepassStatus.CANCELLED:
        // CANCELLED is rare
        multiplier = 0.3;
        break;
      case GatepassStatus.COMPLETED:
      case GatepassStatus.AWAITING_DOCS:
        // These are common intermediate states
        multiplier = 1.0;
        break;
      default:
        multiplier = 1.0;
    }

    const adjustedCount = Math.floor(gatepassCount * multiplier);
    const count = faker.number.int({
      min: Math.max(1, Math.floor(adjustedCount * (1 - variation))),
      max: Math.ceil(adjustedCount * (1 + variation)),
    });

    statusCounts[status] = count;
    totalGatepasses += count;
  }

  console.log(`
Seeding database with:
- ${userCount} additional users per role
- Varied gatepasses per status (${totalGatepasses} total):
${Object.entries(statusCounts)
  .map(([status, count]) => `  - ${status}: ${count}`)
  .join("\n")}
- Default password: ${defaultPassword}
- Salt rounds: ${saltRounds}
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

  console.log("\nCreating users...");

  // Create default users
  const defaultUsers = await Promise.all([
    generateUser(Role.ADMIN, 0, defaultPassword, saltRounds),
    generateUser(Role.GUARD, 0, defaultPassword, saltRounds),
    generateUser(Role.DISPATCH, 0, defaultPassword, saltRounds),
    generateUser(Role.WAREHOUSE, 0, defaultPassword, saltRounds),
  ]);

  // Create additional users for each role
  const additionalUsers = await Promise.all([
    ...Array(userCount)
      .fill(0)
      .map((_, i) =>
        generateUser(Role.ADMIN, i + 1, defaultPassword, saltRounds)
      ),
    ...Array(userCount)
      .fill(0)
      .map((_, i) =>
        generateUser(Role.GUARD, i + 1, defaultPassword, saltRounds)
      ),
    ...Array(userCount)
      .fill(0)
      .map((_, i) =>
        generateUser(Role.DISPATCH, i + 1, defaultPassword, saltRounds)
      ),
    ...Array(userCount)
      .fill(0)
      .map((_, i) =>
        generateUser(Role.WAREHOUSE, i + 1, defaultPassword, saltRounds)
      ),
  ]);

  const allUsers = [...defaultUsers, ...additionalUsers];

  // Create a unique formNumber generator using a counter
  // This ensures no collisions even when generating many gatepasses
  let formNumberCounter = 10000; // Start from 10000 to ensure 5-digit numbers
  const generateUniqueFormNumber = (): string => {
    const formNumber = `GP${formNumberCounter++}`;
    return formNumber;
  };

  // Helper function to process items in batches to avoid connection pool exhaustion
  const processInBatches = async <T, R>(
    items: T[],
    batchSize: number,
    processor: (item: T) => Promise<R>
  ): Promise<R[]> => {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    }
    return results;
  };

  // Create gatepass data for each status (without executing creates yet)
  const batchSize = 20; // Process 20 gatepasses at a time
  const allGatepassData: Array<{ data: any }> = [];

  for (const status of Object.values(GatepassStatus)) {
    const countForStatus = statusCounts[status];
    for (let i = 0; i < countForStatus; i++) {
      allGatepassData.push({
        data: generateGatepassForStatus(
          allUsers,
          status,
          generateUniqueFormNumber
        ),
      });
    }
  }

  // Process all gatepasses in batches to avoid connection pool exhaustion
  const gatepasses = await processInBatches(
    allGatepassData,
    batchSize,
    (gatepassData) => prisma.gatepass.create(gatepassData)
  );

  console.log(
    `\n✓ Created ${allUsers.length} users and ${gatepasses.length} gatepasses`
  );
  console.log(`\nGatepass breakdown by status:`);
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  - ${status}: ${count}`);
  });
  console.log(`\nDefault users created:`);
  console.log(`  - admin0@example.com (ADMIN)`);
  console.log(`  - guard0@example.com (GUARD)`);
  console.log(`  - dispatch0@example.com (DISPATCH)`);
  console.log(`  - warehouse0@example.com (WAREHOUSE)`);
  console.log(`\nAll users have password: ${defaultPassword}`);
  console.log(
    `\nGatepasses created for all statuses including EXITED (closed out)`
  );
  console.log(
    `  - Use the status filter in the gatepass list to view EXITED gatepasses`
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
