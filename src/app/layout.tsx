import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: "Whisky Tasting Platform",
  description: "A structured archive of whisky tastings"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <SiteHeader />
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
