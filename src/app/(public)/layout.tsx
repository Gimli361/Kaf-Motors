import Link from "next/link";
import { Car } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Car className="size-6" /> KAF Motors
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/ilanlar" className="hover:text-primary">
              Tüm İlanlar
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} KAF Motors — Tüm hakları saklıdır.
      </footer>
    </>
  );
}
