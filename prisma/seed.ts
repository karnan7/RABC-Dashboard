import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../app/lib/password";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const teams = [
  {
    name: "Engineering",
    code: "ENG",
    description: "Builds and maintains the product.",
  },
  {
    name: "Operations",
    code: "OPS",
    description: "Keeps the business running smoothly.",
  },
] as const;

const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    role: Role.ADMIN,
    teamCode: "ENG",
  },
  {
    name: "Engineering Manager",
    email: "manager@example.com",
    role: Role.MANAGER,
    teamCode: "ENG",
  },
  {
    name: "Team Member",
    email: "user@example.com",
    role: Role.USER,
    teamCode: "ENG",
  },
  {
    name: "Guest User",
    email: "guest@example.com",
    role: Role.GUEST,
    teamCode: "OPS",
  },
] as const;

async function main() {
  const password = await hashPassword("password123");
  const teamIds = new Map<string, string>();

  for (const team of teams) {
    const seededTeam = await prisma.team.upsert({
      where: { code: team.code },
      update: {
        name: team.name,
        description: team.description,
      },
      create: team,
    });

    teamIds.set(team.code, seededTeam.id);
  }

  for (const user of users) {
    const teamId = teamIds.get(user.teamCode);

    if (!teamId) {
      throw new Error(`Team ${user.teamCode} was not created.`);
    }

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password,
        role: user.role,
        teamId,
      },
      create: {
        name: user.name,
        email: user.email,
        password,
        role: user.role,
        teamId,
      },
    });
  }

  console.log(`Seeded ${teams.length} teams and ${users.length} users.`);
  console.log("All seeded users have the password: password123");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
