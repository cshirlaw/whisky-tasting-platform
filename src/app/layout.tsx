import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: "Blended Scotch Whisky",
  description: "A quiet reference for standard blended Scotch whiskies commonly found in retail, starting with expert tastings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <SiteHeader />
        <div className="mx-auto max-w-5xl px-4 py-8">
          {children}
        </div>
      </body>
    </html>
  );
}
