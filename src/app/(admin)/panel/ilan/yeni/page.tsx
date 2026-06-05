import { createClient } from "@/lib/supabase/server";
import { IlanWizard } from "@/components/admin/ilan-wizard";

export const metadata = { title: "Yeni İlan — KAF Motors" };
export const dynamic = "force-dynamic";

export default async function YeniIlanPage() {
  const supabase = await createClient();
  const [markalar, modeller, donanimlar] = await Promise.all([
    supabase.from("markalar").select("*").order("ad"),
    supabase.from("modeller").select("*").order("ad"),
    supabase.from("donanim_ozellikleri").select("*").order("id"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Yeni İlan Ekle</h1>
      <IlanWizard
        markalar={markalar.data ?? []}
        modeller={modeller.data ?? []}
        donanimlar={donanimlar.data ?? []}
      />
    </div>
  );
}
