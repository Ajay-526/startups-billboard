import { Prisma } from "@/../generated/prisma/client";
import { prisma } from "@/lib/prisma";

const MINIMUM_SPEND = new Prisma.Decimal(10);
const FIRST_PLACE_INCREMENT = new Prisma.Decimal(5);

function utcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function getMinimumSpend() {
  return MINIMUM_SPEND;
}

export async function getRequiredAmountForTop(categoryId?: string) {
  const leader = await prisma.product.findFirst({
    where: categoryId ? { categoryId } : undefined,
    orderBy: [{ totalSpend: "desc" }, { firstClaimedAt: "asc" }],
    select: { totalSpend: true },
  });

  if (!leader) return MINIMUM_SPEND;
  return leader.totalSpend.plus(FIRST_PLACE_INCREMENT);
}

export async function getRequiredAmountForRank(rank: number, categoryId?: string) {
  if (rank < 1) throw new Error("Rank must be positive.");

  const skip = rank - 1;
  const leader = await prisma.product.findFirst({
    where: categoryId ? { categoryId } : undefined,
    orderBy: [{ totalSpend: "desc" }, { firstClaimedAt: "asc" }],
    skip,
    select: { totalSpend: true },
  });

  if (!leader) return MINIMUM_SPEND;
  return leader.totalSpend.plus(1);
}

export async function getBoard({ board, categorySlug, day, page = 1, limit = 50 }: {
  board: "all-time" | "today" | "daily";
  categorySlug?: string;
  day?: Date;
  page?: number;
  limit?: number;
}) {
  const category = categorySlug
    ? await prisma.category.findUnique({ where: { slug: categorySlug }, select: { id: true } })
    : null;

  if (categorySlug && !category) {
    return { entries: [], total: 0, page, limit, day: null };
  }

  const skip = (page - 1) * limit;

  if (board === "all-time") {
    const where = category ? { categoryId: category.id, totalSpend: { gt: 0 } } : { totalSpend: { gt: 0 } };
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ totalSpend: "desc" }, { firstClaimedAt: "asc" }],
        skip,
        take: limit,
        select: {
          id: true, slug: true, title: true, url: true, xHandle: true,
          description: true, totalSpend: true, firstClaimedAt: true,
          category: { select: { name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { entries: products.map((product, index) => ({
      rank: skip + index + 1,
      ...product,
      amount: product.totalSpend.toString(),
    })), total, page, limit, day: null };
  }

  const targetDay = utcDay(day);
  const where = {
    day: targetDay,
    amount: { gt: 0 },
    ...(category ? { product: { categoryId: category.id } } : {}),
  };

  const [spends, total] = await Promise.all([
    prisma.dailySpend.findMany({
      where,
      orderBy: [{ amount: "desc" }, { firstContributionAt: "asc" }],
      skip,
      take: limit,
      select: {
        amount: true,
        firstContributionAt: true,
        product: {
          select: {
            id: true, slug: true, title: true, url: true, xHandle: true,
            description: true,
            category: { select: { name: true, slug: true } },
          },
        },
      },
    }),
    prisma.dailySpend.count({ where }),
  ]);

  return { entries: spends.map((spend, index) => ({
    rank: skip + index + 1,
    ...spend.product,
    amount: spend.amount.toString(),
    firstContributionAt: spend.firstContributionAt,
  })), total, page, limit, day: targetDay.toISOString() };
}

export async function recordClaim({
  productId,
  amount,
  provider,
  providerPaymentId,
}: {
  productId: string;
  amount: Prisma.Decimal;
  provider?: string;
  providerPaymentId?: string;
}) {
  if (amount.lt(MINIMUM_SPEND)) throw new Error("Minimum claim amount is $10.");

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { id: true, totalSpend: true },
    });
    if (!product) throw new Error("Product not found.");

    const now = new Date();
    const day = utcDay(now);

    const contribution = await tx.bidContribution.create({
      data: {
        productId,
        amount,
        provider,
        providerPaymentId,
      },
    });

    const updated = await tx.product.update({
      where: { id: productId },
      data: { totalSpend: { increment: amount } },
      select: { id: true, totalSpend: true, title: true, slug: true },
    });

    await tx.dailySpend.upsert({
      where: { productId_day: { productId, day } },
      create: {
        productId,
        day,
        amount,
        firstContributionAt: now,
      },
      update: {
        amount: { increment: amount },
      },
    });

    await tx.activity.create({
      data: { productId, type: "CLAIM", amount },
    });

    return { contribution, product: updated };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
