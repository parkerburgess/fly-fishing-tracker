import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { OutingForm } from "@/components/outings/OutingForm";
import { updateOuting } from "@/actions/outings";

export default async function EditOutingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const outing = await prisma.outing.findUnique({ where: { id } });

  if (!outing) notFound();
  if (outing.userId !== session.user.id) redirect("/outings");

  const initialData = {
    date: format(outing.date, "yyyy-MM-dd"),
    location: outing.location,
    caught: outing.caught,
    lost: outing.lost,
    missed: outing.missed,
    weather: outing.weather || "",
    waterConditions: outing.waterConditions || "",
    waterTemp: outing.waterTemp,
    timeSpentMin: outing.timeSpentMin,
    notes: outing.notes || "",
  };

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
