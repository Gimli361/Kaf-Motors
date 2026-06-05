import Link from "next/link";
import { redirect } from "next/navigation";
import { Car, LayoutDashboard, PlusCircle, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cikisYap } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware zaten korur; ikinci güvenlik katmanı
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobil Üst Bar */}
      <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:hidden shrink-0">
        <Link href="/panel" className="flex items-center gap-2 text-md font-bold text-foreground">
          <Car className="size-5 text-primary" />
          <span>KAF <span className="text-primary font-light">Motors</span></span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/panel"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Panel"
          >
            <LayoutDashboard className="size-4.5" />
          </Link>
          <Link
            href="/panel/ilan/yeni"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Yeni İlan"
          >
            <PlusCircle className="size-4.5" />
          </Link>
          <form action={cikisYap} className="inline">
            <button
              type="submit"
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              title="Çıkış"
            >
              <LogOut className="size-4.5" />
            </button>
          </form>
        </div>
      </header>

      {/* Masaüstü Sol Menü */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-muted/30 p-4 md:flex">
        <Link href="/panel" className="mb-6 flex items-center gap-2 px-2 text-lg font-bold">
          <Car className="size-5" /> KAF Motors
        </Link>
        <nav className="flex flex-1 flex-col gap-1 text-sm">
          <Link href="/panel" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent">
            <LayoutDashboard className="size-4" /> Panel
          </Link>
          <Link href="/panel/ilan/yeni" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent">
            <PlusCircle className="size-4" /> Yeni İlan
          </Link>
        </nav>
        <form action={cikisYap}>
          <Button variant="ghost" size="sm" className="w-full justify-start cursor-pointer" type="submit">
            <LogOut className="size-4" /> Çıkış
          </Button>
        </form>
      </aside>

      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
