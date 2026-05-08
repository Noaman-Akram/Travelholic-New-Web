// Minimal pass-through. The locale-aware <html> + <body> is rendered in
// app/[locale]/layout.tsx — we cannot render two <html> trees, so this file
// simply forwards children. Required by Next.js App Router.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
