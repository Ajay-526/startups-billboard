import { SpotStatus, SpotTier } from "../../generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function listActiveSpots() {
  return prisma.spot.findMany({
    where: { status: SpotStatus.ACTIVE },
    orderBy: { position: "asc" },
    select: {
      id: true,
      slug: true,
      position: true,
      tier: true,
      name: true,
      description: true,
      basePrice: true,
    },
  });
}

export async function getSpotByPosition(position: number) {
  return prisma.spot.findUnique({
    where: { position },
    select: {
      id: true,
      slug: true,
      position: true,
      tier: true,
      status: true,
      name: true,
      description: true,
      basePrice: true,
    },
  });
}

export async function getSpotBySlug(slug: string) {
  return prisma.spot.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      position: true,
      tier: true,
      status: true,
      name: true,
      description: true,
      basePrice: true,
    },
  });
}

export async function listSpotsByTier(tier: SpotTier) {
  return prisma.spot.findMany({
    where: { status: SpotStatus.ACTIVE, tier },
    orderBy: { position: "asc" },
    select: {
      id: true,
      slug: true,
      position: true,
      tier: true,
      name: true,
      description: true,
      basePrice: true,
    },
  });
}
