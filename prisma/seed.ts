import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:mysecretpassword@localhost:5432/postgres";

if (!connectionString) throw new Error("DATABASE_URL is required.");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const categories = [
  ["AI", "ai"],
  ["SaaS", "saas"],
  ["Developer", "developer"],
  ["Marketing", "marketing"],
  ["Productivity", "productivity"],
  ["Fintech", "fintech"],
  ["Ecommerce", "ecommerce"],
  ["Health", "health"],
  ["Business", "business"],
  ["Other", "other"],
];

const products = [
  {
    slug: "startup-billboard-demo",
    title: "Startup Billboard",
    url: "https://example.com",
    description: "A demo listing for local development.",
    category: "saas",
    amount: "100.00",
  },
  {
    slug: "launchpad-demo",
    title: "Launchpad",
    url: "https://example.com/launchpad",
    description: "A second demo listing.",
    category: "ai",
    amount: "50.00",
  },
  {
    slug: "maker-tools-demo",
    title: "Maker Tools",
    url: "https://example.com/maker-tools",
    description: "A developer tools demo listing.",
    category: "developer",
    amount: "25.00",
  },
];

async function main() {
  for (const [name, slug] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: product.category },
      select: { id: true },
    });

    const existing = await prisma.product.findUnique({
      where: { slug: product.slug },
      select: { id: true },
    });

    if (!existing) {
      const created = await prisma.product.create({
        data: {
          slug: product.slug,
          title: product.title,
          url: product.url,
          description: product.description,
          categoryId: category.id,
          totalSpend: product.amount,
        },
      });

      const amount = product.amount;
      const day = new Date();
      day.setUTCHours(0, 0, 0, 0);

      await prisma.bidContribution.create({
        data: {
          productId: created.id,
          amount,
          provider: "seed",
        },
      });

      await prisma.dailySpend.create({
        data: {
          productId: created.id,
          day,
          amount,
          firstContributionAt: created.createdAt,
        },
      });
    }
  }

  console.log(
    `Seeded ${categories.length} categories and ${products.length} demo products.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
