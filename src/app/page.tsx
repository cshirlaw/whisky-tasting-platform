import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          Blended Scotch Whisky
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-700 sm:text-base">
          A quiet reference for standard blended Scotch whiskies commonly found in retail, using expert tastings as the starting point.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/bottles"
            className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm transition hover:border-neutral-300 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          >
            Browse bottles
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-neutral-900">Bottles first</div>
          <p className="mt-1 text-sm leading-relaxed text-neutral-700">
            Each bottle is a stable reference page, with tastings and basic facts in one place.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-neutral-900">Expert-led</div>
          <p className="mt-1 text-sm leading-relaxed text-neutral-700">
            We start with expert tastings. Consumer tastings may come later, but only real ones.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-neutral-900">No noise</div>
          <p className="mt-1 text-sm leading-relaxed text-neutral-700">
            A restrained design with minimal clutter, so the bottles and notes can speak.
          </p>
        </div>
      </section>

      <div className="mt-10 text-sm">
        <Link className="underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900" href="/bottles">
          Go to Bottles
        </Link>
      </div>
    </main>
  );
}
