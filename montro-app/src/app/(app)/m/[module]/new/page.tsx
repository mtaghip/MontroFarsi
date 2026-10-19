import { notFound } from "next/navigation";
import { MODULES } from "@/lib/modules";
import RecordForm from "@/components/RecordForm";

export default async function NewRecord({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const def = MODULES[module];
  if (!def) notFound();
  return (
    <div>
      <div className="page-h"><h1>Add — {def.title}</h1></div>
      <RecordForm def={def} />
    </div>
  );
}
