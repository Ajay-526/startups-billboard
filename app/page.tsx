import Link from "next/link";
import { getBoard, getRequiredAmountForTop } from "@/lib/board/ranking";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [board, topAmount] = await Promise.all([
    getBoard({ board: "all-time", page: 1, limit: 50 }),
    getRequiredAmountForTop(),
  ]);

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Link href="/" className="text-lg font-black tracking-tight">
          THE STARTUP BILLBOARD
        </Link>
        <nav className="flex items-center gap-5 text-sm text-white/60">
          <Link href="/?board=today">Today</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/about">About</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-5 pb-14 pt-16 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-300">
          PAY TO RANK
        </p>
        <h1 className="mt-5 text-5xl font-black tracking-[-0.05em] sm:text-7xl">
          Put your startup
          <br />
          on the wall.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/50">
          Your rank is what you pay. Pay more to climb above everyone who paid
          less.
        </p>

        <div className="mx-auto mt-10 max-w-md rounded-3xl border border-white/10 bg-white/[.04] p-6 text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-white/40">
            Claim #1
          </div>
          <div className="mt-2 text-4xl font-black">
            \${topAmount.toString()}
          </div>
          <p className="mt-2 text-sm text-white/40">
            Minimum amount required to take the top spot.
          </p>
          <Link
            href="/claim"
            className="mt-5 block rounded-xl bg-lime-300 px-5 py-3 text-center font-bold text-black transition hover:bg-lime-200"
          >
            Claim a rank
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
              ALL-TIME
            </p>
            <h2 className="mt-2 text-2xl font-black">The leaderboard</h2>
          </div>
          <span className="text-sm text-white/30">{board.total} products</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          {board.entries.length === 0 ? (
            <div className="p-10 text-center text-white/40">
              Be the first startup on the board.
            </div>
          ) : (
            board.entries.map((entry) => (
              <Link
                key={entry.id}
                href={entry.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 border-b border-white/[.07] px-5 py-5 transition hover:bg-white/[.04]"
              >
                <span className="w-10 text-sm font-bold text-white/30">
                  #{entry.rank}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">
                    {entry.title}
                  </span>
                  <span className="block truncate text-xs text-white/35">
                    {entry.category.name}
                  </span>
                </span>
                <span className="font-mono text-sm font-bold">
                  \${entry.amount}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
