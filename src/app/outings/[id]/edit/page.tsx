import dal from "@/lib/dal";
import { getUserId } from "@parkerburgess/wandering-parker-server";
import { notFound, redirect } from "next/navigation";
import { OutingForm } from "@/components/outings/OutingForm";
import { updateOuting } from "@/actions/outings";
import { toOutingFormDto } from "@/lib/hydrate/outings";

export default async function EditOutingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const outingId = Number(id);
  if (!Number.isInteger(outingId)) notFound();

  const userId = await getUserId();

  const outing = await dal.getOuting(outingId);

  if (!outing) notFound();
  if (outing.userId !== userId) redirect("/outings");

  const initialData = toOutingFormDto(outing);

  async function handleUpdate(formData: FormData) {
    "use server";
    return updateOuting(id, formData);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Outing</h1>
      <OutingForm
        action={handleUpdate}
        initialData={initialData}
        submitLabel="Update Outing"
      />
    </div>
  );
}
