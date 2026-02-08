import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DeleteOutingButton } from "@/components/outings/DeleteOutingButton";
import { PhotoUploader } from "@/components/outings/PhotoUploader";

export default async function OutingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const outing = await prisma.outing.findUnique({
    where: { id },
    include: { user: true, photos: true },
  });

  if (!outing) notFound();

  const session = await auth();
  const isOwner = session?.user?.id === outing.userId;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{outing.location}</h1>
          <p className="text-gray-500">{format(outing.date, "MMMM d, yyyy")}</p>
          <Link
            href={`/users/${outing.userId}`}
            className="text-sm text-blue-600 hover:underline"
          >
            by {outing.user.name}
          </Link>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Link href={`/outings/${outing.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <DeleteOutingButton outingId={outing.id} />
          </div>
        )}
      </div>

      <Card className="mb-6">
        <div className="text-center mb-4">
          <p className="text-4xl font-bold text-blue-600">{outing.score} pts</p>
          <p className="text-sm text-gray-500 mt-1">Total Score</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-semibold text-green-600">{outing.caught}</p>
            <p className="text-xs text-gray-500">Caught (5 pts)</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-yellow-600">{outing.lost}</p>
            <p className="text-xs text-gray-500">Lost (3 pts)</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-red-600">{outing.missed}</p>
            <p className="text-xs text-gray-500">Missed (1 pt)</p>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-semibold mb-3">Conditions</h2>
        <div className="grid grid-cols-2 gap-4">
          {outing.weather && (
            <div>
              <p className="text-xs text-gray-500">Weather</p>
              <Badge>{outing.weather}</Badge>
            </div>
          )}
          {outing.waterConditions && (
            <div>
              <p className="text-xs text-gray-500">Water</p>
              <Badge color="green">{outing.waterConditions}</Badge>
            </div>
          )}
          {outing.waterTemp !== null && (
            <div>
              <p className="text-xs text-gray-500">Water Temp</p>
              <p className="font-medium">{outing.waterTemp}°F</p>
            </div>
          )}
          {outing.timeSpentMin !== null && (
            <div>
              <p className="text-xs text-gray-500">Time Spent</p>
              <p className="font-medium">
                {Math.floor(outing.timeSpentMin / 60)}h {outing.timeSpentMin % 60}m
              </p>
            </div>
          )}
        </div>
      </Card>

      {outing.notes && (
        <Card className="mb-6">
          <h2 className="font-semibold mb-2">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{outing.notes}</p>
        </Card>
      )}

      {outing.photos.length > 0 && (
        <Card className="mb-6">
          <h2 className="font-semibold mb-3">Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {outing.photos.map((photo) => (
              <div key={photo.id}>
                <img
                  src={`/uploads/${photo.filename}`}
                  alt={photo.caption || "Outing photo"}
                  className="rounded-lg w-full h-40 object-cover"
                />
                {photo.caption && (
                  <p className="text-xs text-gray-500 mt-1">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {isOwner && (
        <Card>
          <PhotoUploader outingId={outing.id} />
        </Card>
      )}
    </div>
  );
}
