import type { JsonLdValue } from "@/lib/seo/jsonLd";

/**
 * Server Component that renders one or more JSON-LD blocks.
 * Pass either a single object or an array. The script tag is
 * inlined in the page body — Google Search reads it from SSR HTML.
 */
export function JsonLd({ data }: { data: JsonLdValue | JsonLdValue[] }) {
  const list = Array.isArray(data) ? data : [data];
  return (
    <>
      {list.map((entry, i) => (
        <script
          key={i}
          type="application/ld+json"
          // The data is built server-side from internal data only — no user input.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(entry, jsonReplacer),
          }}
        />
      ))}
    </>
  );
}

function jsonReplacer(_key: string, value: unknown): unknown {
  if (value === undefined) return undefined;
  return value;
}
