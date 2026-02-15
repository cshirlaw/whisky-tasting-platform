"use client";

import { useMemo, useState } from "react";

type PostPayload = {
  reviewer: { id: string; name: string };
  bottle: { key: string; name_display: string; category: string };
  tasted_date: string;
  overall_1_10: number;
  served?: "Neat" | "With water" | "Highball" | "Cocktail" | "Other";
  would_buy_again?: boolean;
  summary?: string | null;
};

export default function AdminConsumerReviewPage() {
  const today = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [token, setToken] = useState("");
  const [reviewerId, setReviewerId] = useState("reviewer-consumer-anon-0001");
  const [reviewerName, setReviewerName] = useState("reviewer-consumer-anon-0001");

  const [bottleKey, setBottleKey] = useState("errol-wings-12yo");
  const [bottleName, setBottleName] = useState("Errol Wings 12 Year Old");
  const [bottleCategory, setBottleCategory] = useState("Blended Scotch Whisky");

  const [tastedDate, setTastedDate] = useState(today);
  const [overall, setOverall] = useState(8);
  const [served, setServed] = useState<PostPayload["served"]>("Neat");
  const [wouldBuyAgain, setWouldBuyAgain] = useState(true);
  const [summary, setSummary] = useState("Admin test entry.");

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; status: number; body: any } | null>(null);

  const payload: PostPayload = {
    reviewer: { id: reviewerId.trim(), name: reviewerName.trim() },
    bottle: { key: bottleKey.trim(), name_display: bottleName.trim(), category: bottleCategory.trim() },
    tasted_date: tastedDate.trim(),
    overall_1_10: Number(overall),
    served,
    would_buy_again: Boolean(wouldBuyAgain),
    summary: summary.trim() ? summary.trim() : null,
  };

  async function submit() {
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/api/admin/consumer-reviews", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": token.trim(),
        },
        body: JSON.stringify(payload),
      });
      let body: any = null;
      try {
        body = await r.json();
      } catch {
        body = { error: "Non-JSON response" };
      }
      setResult({ ok: r.ok, status: r.status, body });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Admin: Consumer Review</h1>
        <p className="text-sm text-neutral-600">
          This posts a consumer review JSON into <code className="font-mono">data/tastings/consumers/...</code> via the admin API.
        </p>
      </div>

      <div className="grid gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Admin token</span>
          <input
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste ADMIN_TOKEN from .env.local"
            spellCheck={false}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Reviewer id</span>
            <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" value={reviewerId} onChange={(e) => setReviewerId(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Reviewer name</span>
            <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Bottle key</span>
            <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" value={bottleKey} onChange={(e) => setBottleKey(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Bottle category</span>
            <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" value={bottleCategory} onChange={(e) => setBottleCategory(e.target.value)} />
          </label>

          <label className="grid gap-1 md:col-span-2">
            <span className="text-sm font-medium">Bottle display name</span>
            <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" value={bottleName} onChange={(e) => setBottleName(e.target.value)} />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Tasted date</span>
            <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" value={tastedDate} onChange={(e) => setTastedDate(e.target.value)} />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Overall (1–10)</span>
            <input
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              type="number"
              min={1}
              max={10}
              value={overall}
              onChange={(e) => setOverall(parseInt(e.target.value || "0", 10))}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Served</span>
            <select className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" value={served} onChange={(e) => setServed(e.target.value as any)}>
              <option>Neat</option>
              <option>With water</option>
              <option>Highball</option>
              <option>Cocktail</option>
              <option>Other</option>
            </select>
          </label>

          <label className="flex items-center gap-2 pt-6">
            <input type="checkbox" checked={wouldBuyAgain} onChange={(e) => setWouldBuyAgain(e.target.checked)} />
            <span className="text-sm">Would buy again</span>
          </label>

          <label className="grid gap-1 md:col-span-2">
            <span className="text-sm font-medium">Summary</span>
            <input className="rounded-lg border border-neutral-200 px-3 py-2 text-sm" value={summary} onChange={(e) => setSummary(e.target.value)} />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-60"
            onClick={submit}
            disabled={busy || !token.trim()}
          >
            {busy ? "Posting…" : "Post review"}
          </button>

          <div className="text-xs text-neutral-600">
            Posts to <code className="font-mono">/api/admin/consumer-reviews</code>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="text-sm font-medium">Payload preview</div>
        <pre className="overflow-auto rounded-xl border border-neutral-200 bg-white p-4 text-xs">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>

      {result && (
        <div className="grid gap-3">
          <div className="text-sm font-medium">Result</div>
          <pre className="overflow-auto rounded-xl border border-neutral-200 bg-white p-4 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
