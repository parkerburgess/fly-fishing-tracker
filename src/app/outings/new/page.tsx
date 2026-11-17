import { OutingForm } from "@/components/outings/OutingForm";
import { createOuting } from "@/actions/outings";

export default function NewOutingPage() {
  // #region Tailwind utility consts
  const pageCls = "max-w-2xl mx-auto";
  const titleCls = "text-2xl font-bold mb-6";
  // #endregion

  return (
    <div className={pageCls}>
      <h1 className={titleCls}>New Outing</h1>
      <OutingForm action={createOuting} submitLabel="Create Outing" />
    </div>
  );
}
