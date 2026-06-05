import Link from "next/link";
import { Car } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="group flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-foreground transition-colors hover:text-primary">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <Car className="size-5" />
            </div>
            <span>KAF <span className="text-primary font-light">Motors</span></span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/ilanlar"
              className="font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Tüm İlanlar
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-border/60 bg-card py-8 text-center text-xs text-muted-foreground/80">
        <div className="mx-auto max-w-6xl px-4">
          <p className="font-medium">© {new Date().getFullYear()} KAF Motors — Tüm hakları saklıdır.</p>
          <p className="mt-1 text-[10px] text-muted-foreground/60">Güvenilir ve ekspertizli ikinci el araç platformu.</p>
        </div>
      </footer>
    </>
  );
}
