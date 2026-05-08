// Fallback 404 for paths outside any locale segment.
// next-intl middleware redirects most traffic to /<locale>; this catches edge cases.

import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          background: "#EFEDE5",
          color: "#00273E",
          fontFamily: "Inter, system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <main style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: "0.75rem",
              opacity: 0.6,
            }}
          >
            Travelholic
          </p>
          <h1 style={{ fontSize: "2rem", margin: "1rem 0", fontWeight: 600 }}>
            This home is no longer available.
          </h1>
          <p style={{ opacity: 0.8 }}>
            <Link href="/en">Back to home</Link>
          </p>
        </main>
      </body>
    </html>
  );
}
