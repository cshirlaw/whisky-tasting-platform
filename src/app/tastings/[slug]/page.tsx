import Link from "next/link";
import { notFound } from "next/navigation";
import { getDavidReidTasting, listDavidReidTastings } from "@/lib/tastings";
import { resolveBottlerName } from "@/lib/lookups";

export function generateStaticParams() {
  return listDavidReidTastings().map(({ slug }) => ({ slug }));
}

export default function TastingPage({ params }: { params: { slug: string } }) {
  const result = getDavidReidTasting(params.slug);
  if (!result) return notFound();

  const { tasting, slug } = result;
  const bottler = resolveBottlerName(tasting.whisky.brand_or_label);

  return (
    <main className="prose max-w-none">
      <p>
        <Link href="/">Home</Link> · <Link href="/tastings">Tastings</Link>
      </p>

      <h1>{tasting.whisky.name_display}</h1>

      <ul>
        <li>
          <strong>Contributor:</strong> {tasting.contributor.name} ({tasting.contributor.tier})
        </li>
        {bottler ? (
          <li>
            <strong>Bottler:</strong> {bottler}
          </li>
        ) : null}
        {tasting.whisky.distillery ? (
          <li>
            <strong>Distillery:</strong> {tasting.whisky.distillery}
          </li>
        ) : null}
        {tasting.whisky.region ? (
          <li>
            <strong>Region:</strong> {tasting.whisky.region}
          </li>
        ) : null}
        {tasting.whisky.age_years !== null && tasting.whisky.age_years !== undefined ? (
          <li>
            <strong>Age:</strong> {tasting.whisky.age_years}yo
          </li>
        ) : null}
        {tasting.whisky.abv_percent !== null && tasting.whisky.abv_percent !== undefined ? (
          <li>
            <strong>ABV:</strong> {tasting.whisky.abv_percent}%
          </li>
        ) : null}
      </ul>

      {tasting.tasting.summary ? (
        <>
          <h2>Summary</h2>
          <p>{tasting.tasting.summary}</p>
        </>
      ) : null}

      <h2>Notes</h2>

      <h3>Nose</h3>
      {tasting.tasting.notes.nose.length ? (
        <ul>{tasting.tasting.notes.nose.map((x, i) => <li key={i}>{x}</li>)}</ul>
      ) : (
        <p>—</p>
      )}

      <h3>Palate</h3>
      {tasting.tasting.notes.palate.length ? (
        <ul>{tasting.tasting.notes.palate.map((x, i) => <li key={i}>{x}</li>)}</ul>
      ) : (
        <p>—</p>
      )}

      <h3>Finish</h3>
      {tasting.tasting.notes.finish.length ? (
        <ul>{tasting.tasting.notes.finish.map((x, i) => <li key={i}>{x}</li>)}</ul>
      ) : (
        <p>—</p>
      )}

      <h3>Overall</h3>
      {tasting.tasting.notes.overall.length ? (
        <ul>{tasting.tasting.notes.overall.map((x, i) => <li key={i}>{x}</li>)}</ul>
      ) : (
        <p>—</p>
      )}

      <h2>Source</h2>
      <p className="text-sm text-slate-600">
        Assets folder: <code>{tasting.source.assets?.[0]?.path ?? "—"}</code>
      </p>

      <p className="text-sm text-slate-600">
        Record slug: <code>{slug}</code>
      </p>
    </main>
  );
}
