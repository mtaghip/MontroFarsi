import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InventoryForm from "@/components/InventoryForm";

export const dynamic = "force-dynamic";

export default async function EditInventory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("inventory").select("*").eq("id", id).single();
  if (!data) notFound();
  return (
    <div>
      <div className="page-h"><h1>Edit item</h1></div>
      <InventoryForm initial={data} />
    </div>
  );
}
