import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("carehub2024!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@carehub.kr" },
    update: {},
    create: {
      email: "admin@carehub.kr",
      password: hashedPassword,
      name: "관리자",
      role: "admin",
    },
  });

  console.log(`Created admin user: ${admin.email}`);
  console.log("Password: carehub2024!");

  // Sample member
  const member = await prisma.member.upsert({
    where: { id: "sample-member-001" },
    update: {},
    create: {
      id: "sample-member-001",
      name: "홍길동",
      birth_date: new Date("1950-05-15"),
      gender: "남",
      first_visit_date: new Date("2024-01-10"),
    },
  });

  console.log(`Created sample member: ${member.name}`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
