import { OutingForm } from "@/components/outings/OutingForm";
import { createOuting } from "@/actions/outings";

export default function NewOutingPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Outing</h1>
      <OutingForm action={createOuting} submitLabel="Create Outing" />
    </div>
  );
}
