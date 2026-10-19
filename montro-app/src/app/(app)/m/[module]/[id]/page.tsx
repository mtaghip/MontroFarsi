import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MODULES } from "@/lib/modules";
import RecordForm from "@/components/RecordForm";

export const dynamic = "force-dynamic";

export default async function EditRecord({ params }: { params: Promise<{ module: string; id: string }> }) {
  const { module, id } = await params;
  const def = MODULES[module];
  if (!def) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from(def.table).select("*").eq("id", id).single();
  if (!data) notFound();
  return (
    <div>
      <div className="page-h"><h1>Edit — {def.title}</h1></div>
      <RecordForm def={def} initial={data} />
    </div>
  );
}
