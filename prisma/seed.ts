import { PrismaClient, SpotTier } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const spots = [
  { position: 1, slug: "top-spot", tier: SpotTier.HERO, name: "The #1 Spot", description: "The dominant billboard position.", basePrice: "25000.00" },
  { position: 2, slug: "prime-02", tier: SpotTier.PRIME, name: "Prime Spot 02", description: "High-visibility ranked position.", basePrice: "12000.00" },
  { position: 3, slug: "prime-03", tier: SpotTier.PRIME, name: "Prime Spot 03", description: "High-visibility ranked position.", basePrice: "9000.00" },
  { position: 4, slug: "prime-04", tier: SpotTier.PRIME, name: "Prime Spot 04", description: "High-visibility ranked position.", basePrice: "7000.00" },
  { position: 5, slug: "standard-05", tier: SpotTier.STANDARD, name: "Standard Spot 05", description: "Ranked billboard position.", basePrice: "5000.00" },
  { position: 6, slug: "standard-06", tier: SpotTier.STANDARD, name: "Standard Spot 06", description: "Ranked billboard position.", basePrice: "3500.00" },
];

async function main() {
  for (const spot of spots) {
    await prisma.spot.upsert({
      where: { position: spot.position },
      update: {
        slug: spot.slug,
        tier: spot.tier,
        name: spot.name,
        description: spot.description,
        basePrice: spot.basePrice,
      },
      create: spot,
    });
  }
  console.log(`Seeded ${spots.length} billboard spots.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
