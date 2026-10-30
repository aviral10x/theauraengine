import "server-only";
import { db } from "./db";

/** Credit pricing. 1 credit ≈ $0.10 retail. Tuned so blended gross margin stays healthy on Higgsfield list prices. */
export const COSTS = {
  scan: 0,
  series: 3,
  episodeScript: 1,
  characterSheet: 2,
  frame: 1,
  videoPerSecond: { turbo: 1, std: 2, pro: 4 } as Record<string, number>,
};

export class InsufficientCreditsError extends Error {
  constructor(public needed: number, public available: number) {
    super(`Not enough credits: need ${needed}, have ${available}`);
  }
}

/** Atomically deduct credits. Throws InsufficientCreditsError when the balance is too low. */
export async function chargeCredits(userId: string, amount: number, reason: string, refId?: string) {
  if (amount <= 0) return;
  await db.$transaction(async (tx) => {
    const res = await tx.user.updateMany({
      where: { id: userId, credits: { gte: amount } },
      data: { credits: { decrement: amount } },
    });
    if (res.count === 0) {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { credits: true } });
      throw new InsufficientCreditsError(amount, user?.credits ?? 0);
    }
    await tx.creditLedger.create({ data: { userId, delta: -amount, reason, refId } });
  });
}

export async function grantCredits(userId: string, amount: number, reason: string, refId?: string) {
  if (amount <= 0) return false;
  try {
    await db.$transaction([
      db.creditLedger.create({ data: { userId, delta: amount, reason, refId } }),
      db.user.update({ where: { id: userId }, data: { credits: { increment: amount } } }),
    ]);
    return true;
  } catch (e) {
    // Unique refId violation means this grant was already applied (idempotent webhooks).
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002") return false;
    throw e;
  }
}
