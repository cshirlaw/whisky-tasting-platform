"use client";

import { useEffect, useMemo, useState } from "react";

type BottleRow = {
  bottle: { key: string; name: string; category?: string };
};

type Reviewer = {
  id: string;
  name: string;
  tier?: string;
};

function today() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AdminConsumerReviewPage() {
  const [adminToken, setAdminToken] = useState("");
  const [bottles, setBottles] = useState<BottleRow[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewerId, setReviewerId] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [bottleKey, setBottleKey] = useState("");
  const [tastedDate, setTastedDate] = useState(today());
  const [overall, setOverall] = useState(7);
  const [served, setServed] = useState<"Neat" | "With water" | "Highball" | "Cocktail" | "Other">("Neat");
  const [wouldBuyAgain, setWouldBuyAgain] = useState(true);
  const [summary, setSummary] = useState("");

  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [b, r] = await Promise.all([fetch("/api/bottles"), fetch("/api/reviewers")]);
        const bj = await b.json();
        const rj = await r.json();
        if (!alive) return;

        const onlyConsumers = (Array.isArray(rj) ? rj : []).filter((x: any) => x?.tier === "consumer");
        setReviewers(onlyConsumers);

        setBottles(Array.isArray(bj) ? bj : []);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  const selectedBottle = useMemo(() => {
    const row = bottles.find((x) => x?.bottle?.key === bottleKey);
    if (!row) return null;
    return {
      key: row.bottle.key,
      name_display: row.bottle.name,
      category: row.bottle.category || "Blended Scotch Whisky",
    };
  }, [bottles, bottleKey]);

  const canSubmit =
    adminToken.trim().length > 0 &&
    reviewerId.trim().length > 0 &&
    reviewerName.trim().length > 0 &&
    !!selectedBottle &&
    tastedDate.trim().length > 0 &&
    overall >= 1 &&
    overall <= 10;

  async function submit() {
    setResult(null);
    setError(null);

    if (!canSubmit || !selectedBottle) return;

    const payload = {
      reviewer: { id: reviewerId.trim(), name: reviewerName.trim() },
      bottle: selectedBottle,
      tasted_date: tastedDate.trim(),
      overall_1_10: overall,
      served,
      would_buy_again: wouldBuyAgain,
      summary: summary.trim() ? summary.trim() : null,
    };

    try {
      const res = await fetch("/api/admin/consumer-reviews", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken.trim(),
        },
        body: JSON.stringify(payload),
      });

      const j = await res.json().catch(() => null);

      if (!res.ok) {
        setError(j?.error || `Failed (${res.status})`);
        return;
      }

      setResult(`Wrote ${j?.written || "(unknown)"}\nSlug: ${decodeURIComponent(String(j?.slug || ""))}`);
    } catch (e: any) {
      setError(e?.message || "Failed");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Admin: Enter a consumer review</h1>
      <p className="mt-2 text-sm text-neutral-600">
        This writes a locked, minimal consumer review JSON into <span className="font-mono">data/tastings/consumers/&lt;reviewerId&gt;/</span>.
      </p>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Access</h2>
        <label className="mt-3 block text-sm text-neutral-700">
          Admin token (from <span className="font-mono">ADMIN_TOKEN</span>)
          <input
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm"
            placeholder="Paste token here"
          />
        </label>
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Reviewer</h2>

        {loading ? (
          <p className="mt-3 text-sm text-neutral-600">Loading…</p>
        ) : (
          <>
            <label className="mt-3 block text-sm text-neutral-700">
              Select consumer reviewer
              <select
                value={reviewerId}
                onChange={(e) => {
                  const id = e.target.value;
                  setReviewerId(id);
                  const r = reviewers.find((x) => x.id === id);
                  setReviewerName(r?.name || "");
                }}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm"
              >
                <option value="">Select…</option>
                {reviewers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.id})
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm text-neutral-700">
                Reviewer id
                <input
                  value={reviewerId}
                  onChange={(e) => setReviewerId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm"
                  placeholder="reviewer-consumer-anon-0001"
                />
              </label>

              <label className="block text-sm text-neutral-700">
                Display name
                <input
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm"
                  placeholder="Anonymous"
                />
              </label>
            </div>
          </>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Bottle</h2>

        {loading ? (
          <p className="mt-3 text-sm text-neutral-600">Loading…</p>
        ) : (
          <label className="mt-3 block text-sm text-neutral-700">
            Select bottle
            <select
              value={bottleKey}
              onChange={(e) => setBottleKey(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm"
            >
              <option value="">Select…</option>
              {bottles.map((x) => (
                <option key={x.bottle.key} value={x.bottle.key}>
                  {x.bottle.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Consumer scoring</h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="block text-sm text-neutral-700">
            Tasted date
            <input
              type="date"
              value={tastedDate}
              onChange={(e) => setTastedDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm"
            />
          </label>

          <label className="block text-sm text-neutral-700">
            Overall (1–10)
            <input
              type="number"
              min={1}
              max={10}
              value={overall}
              onChange={(e) => setOverall(Number(e.target.value))}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm"
            />
          </label>

          <label className="block text-sm text-neutral-700">
            Served
            <select
              value={served}
              onChange={(e) => setServed(e.target.value as any)}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm"
            >
              <option value="Neat">Neat</option>
              <option value="With water">With water</option>
              <option value="Highball">Highball</option>
              <option value="Cocktail">Cocktail</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={wouldBuyAgain}
            onChange={(e) => setWouldBuyAgain(e.target.checked)}
            className="h-4 w-4"
          />
          Would buy again
        </label>

        <label className="mt-3 block text-sm text-neutral-700">
          Short summary (optional)
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm"
            rows={3}
            placeholder="One line, plain language."
          />
        </label>

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="mt-4 inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50 disabled:opacity-50"
        >
          Save consumer review JSON
        </button>

        {result ? (
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-800">
            {result}
          </pre>
        ) : null}

        {error ? (
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </pre>
        ) : null}
      </section>
    </main>
  );
}
