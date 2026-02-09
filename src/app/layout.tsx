import "./globals.css";

export const metadata = {
  title: "Whisky Tasting Platform",
  description: "A structured archive of whisky tastings"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <header className="mb-8 border-b pb-4">
            <div className="text-xl font-semibold">Whisky Tasting Platform</div>
            <nav className="mt-2 flex gap-4 text-sm">
              <a className="underline" href="/">Home</a>
              <a className="underline" href="/tastings">Tastings</a>
              <a className="underline" href="/bottles">Bottles</a>
              <a className="underline" href="/reviewers">Reviewers</a>
            </nav>
          </header>

          {children}

          <footer className="mt-12 border-t pt-4 text-xs text-slate-600">
            Built for archive and comparison. Trial content only at this stage.
          </footer>
        </div>
      </body>
    </html>
  );
}
