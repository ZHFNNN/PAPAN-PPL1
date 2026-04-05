import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const adminName = process.env.ADMIN_NAME || "Admin";
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@papan.local";
  const adminPhoneNumber = process.env.ADMIN_PHONE_NUMBER || "081111111111";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log("Admin already exists");
    return;
  }

  const passwordHash = await hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      username: adminUsername,
      name: adminName,
      email: adminEmail,
      phoneNumber: adminPhoneNumber,
      passwordHash,
      role: Role.ADMIN
    }
  });

  console.log("Admin seeded:", adminEmail);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
