import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { CertificationStatus, Prisma, PrismaClient, Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CATEGORIES = ["Vegetables", "Fruits", "Seeds", "Tools", "Organic Compost"];

const randomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  const password = await bcrypt.hash("Password123!", 10);

  // Reset dev data so the seed always yields consistent counts.
  await prisma.order.deleteMany();
  await prisma.rentalBooking.deleteMany();
  await prisma.plantTrack.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.sustainabilityCert.deleteMany();
  await prisma.produce.deleteMany();
  await prisma.rentalSpace.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.upsert({
    where: { email: "admin@urbanfarm.com" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@urbanfarm.com",
      password,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  for (let i = 1; i <= 10; i += 1) {
    const email = `vendor${i}@urbanfarm.com`;
    const vendorUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: `Vendor ${i}`,
        email,
        password,
        role: Role.VENDOR,
        status: UserStatus.ACTIVE,
      },
    });

    const profile = await prisma.vendorProfile.upsert({
      where: { userId: vendorUser.id },
      update: {
        farmName: `Green Roof Farm ${i}`,
        farmLocation: `City Zone ${((i - 1) % 5) + 1}`,
        certificationStatus: CertificationStatus.APPROVED,
      },
      create: {
        userId: vendorUser.id,
        farmName: `Green Roof Farm ${i}`,
        farmLocation: `City Zone ${((i - 1) % 5) + 1}`,
        certificationStatus: CertificationStatus.APPROVED,
      },
    });

    await prisma.sustainabilityCert.create({
      data: {
        vendorId: profile.id,
        certifyingAgency: "Urban Organic Council",
        certificationDate: new Date("2025-01-01"),
        status: CertificationStatus.APPROVED,
      },
    });

    for (let s = 1; s <= 2; s += 1) {
      await prisma.rentalSpace.create({
        data: {
          vendorId: profile.id,
          location: `Block ${i}-${s}`,
          size: `${randomNumber(50, 200)} sq.ft`,
          price: new Prisma.Decimal(randomNumber(30, 90)),
          availability: true,
        },
      });
    }
  }

  for (let i = 1; i <= 20; i += 1) {
    await prisma.user.upsert({
      where: { email: `customer${i}@urbanfarm.com` },
      update: {},
      create: {
        name: `Customer ${i}`,
        email: `customer${i}@urbanfarm.com`,
        password,
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
    });
  }

  const vendors = await prisma.vendorProfile.findMany({ select: { id: true } });

  for (let i = 1; i <= 100; i += 1) {
    const vendor = vendors[(i - 1) % vendors.length];

    await prisma.produce.create({
      data: {
        vendorId: vendor.id,
        name: `Organic Product ${i}`,
        description: `Freshly harvested product number ${i}`,
        price: new Prisma.Decimal(randomNumber(5, 50)),
        category: CATEGORIES[(i - 1) % CATEGORIES.length],
        certificationStatus: CertificationStatus.APPROVED,
        availableQuantity: randomNumber(10, 200),
      },
    });
  }

  const customers = await prisma.user.findMany({ where: { role: Role.CUSTOMER }, select: { id: true } });

  for (let i = 1; i <= 15; i += 1) {
    const customer = customers[(i - 1) % customers.length];
    await prisma.communityPost.create({
      data: {
        userId: customer.id,
        postContent: `Urban farming tip ${i}: compost kitchen scraps and monitor soil moisture regularly.`,
      },
    });
  }

  console.log("Seed complete: 1 admin, 10 vendors, 20 customers, and 100 products created.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
