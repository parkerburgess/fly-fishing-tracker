import dal from "@/lib/dal";
import { getUserId } from "@parkerburgess/wandering-parker-server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Card, Badge, Button } from "@parkerburgess/wandering-parker-ui";
import { DeleteOutingButton } from "@/components/outings/DeleteOutingButton";
import { PhotoUploader } from "@/components/outings/PhotoUploader";
import { BackButton } from "@/components/outings/BackButton";
import { deleteOuting } from "@/actions/outings";

export default async function OutingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const outingId = Number(id);
  if (!Number.isInteger(outingId)) notFound();

  const outing = await dal.getOuting(outingId);

  if (!outing) notFound();

  const userId = await getUserId();
  const isOwner = userId === outing.userId;

  async function handleDelete() {
    "use server";
    return deleteOuting(id);
  }

  // #region Tailwind utility consts
  const pageCls = "max-w-2xl mx-auto";
  const pageHeaderCls = "flex justify-between items-start mb-6";
  const titleCls = "text-2xl font-bold";
  const dateCls = "text-gray-500";
  const authorLinkCls = "text-sm text-blue-600 hover:underline cursor-pointer";
  const ownerActionsCls = "flex gap-2";
  const sectionCardCls = "mb-6";
  const scoreBlockCls = "text-center mb-4";
  const scoreValueCls = "text-4xl font-bold text-blue-600";
  const scoreLabelCls = "text-sm text-gray-500 mt-1";
  const countsGridCls = "grid grid-cols-3 gap-4 text-center";
  const caughtValueCls = "text-2xl font-semibold text-green-600";
  const lostValueCls = "text-2xl font-semibold text-yellow-600";
  const missedValueCls = "text-2xl font-semibold text-red-600";
  const statLabelCls = "text-xs text-gray-500";
  const sectionHeadingCls = "font-semibold mb-3";
  const notesHeadingCls = "font-semibold mb-2";
  const conditionsGridCls = "grid grid-cols-2 gap-4";
  const conditionValueCls = "font-medium";
  const notesTextCls = "text-gray-700 whitespace-pre-wrap";
  const photoGridCls = "grid grid-cols-2 md:grid-cols-3 gap-3";
  const photoImageCls = "rounded-lg w-full h-40 object-cover";
  const photoCaptionCls = "text-xs text-gray-500 mt-1";
  // #endregion

  return (
    <div className={pageCls}>
      <BackButton />
      <div className={pageHeaderCls}>
        <div>
          <h1 className={titleCls}>{outing.location}</h1>
          <p className={dateCls}>{format(outing.date, "MMMM d, yyyy")}</p>
          <Link href={`/users/${outing.userId}`} className={authorLinkCls}>
            by {outing.userDisplayName}
          </Link>
        </div>
        {isOwner && (
          <div className={ownerActionsCls}>
            <Link href={`/outings/${outing.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <DeleteOutingButton onDelete={handleDelete} />
          </div>
        )}
      </div>

      <Card className={sectionCardCls}>
        <div className={scoreBlockCls}>
          <p className={scoreValueCls}>{outing.score} pts</p>
          <p className={scoreLabelCls}>Total Score</p>
        </div>
        <div className={countsGridCls}>
          <div>
            <p className={caughtValueCls}>{outing.caught}</p>
            <p className={statLabelCls}>Caught (5 pts)</p>
          </div>
          <div>
            <p className={lostValueCls}>{outing.lost}</p>
            <p className={statLabelCls}>Lost (3 pts)</p>
          </div>
          <div>
            <p className={missedValueCls}>{outing.missed}</p>
            <p className={statLabelCls}>Missed (1 pt)</p>
          </div>
        </div>
      </Card>

      <Card className={sectionCardCls}>
        <h2 className={sectionHeadingCls}>Conditions</h2>
        <div className={conditionsGridCls}>
          {outing.weather && (
            <div>
              <p className={statLabelCls}>Weather</p>
              <Badge>{outing.weather}</Badge>
            </div>
          )}
          {outing.waterConditions && (
            <div>
              <p className={statLabelCls}>Water</p>
              <Badge color="success">{outing.waterConditions}</Badge>
            </div>
          )}
          {outing.waterTemp !== null && (
            <div>
              <p className={statLabelCls}>Water Temp</p>
              <p className={conditionValueCls}>{outing.waterTemp}°F</p>
            </div>
          )}
          {outing.timeSpentMin !== null && (
            <div>
              <p className={statLabelCls}>Time Spent</p>
              <p className={conditionValueCls}>
                {Math.floor(outing.timeSpentMin / 60)}h {outing.timeSpentMin % 60}m
              </p>
            </div>
          )}
        </div>
      </Card>

      {outing.notes && (
        <Card className={sectionCardCls}>
          <h2 className={notesHeadingCls}>Notes</h2>
          <p className={notesTextCls}>{outing.notes}</p>
        </Card>
      )}

      {outing.photos.length > 0 && (
        <Card className={sectionCardCls}>
          <h2 className={sectionHeadingCls}>Photos</h2>
          <div className={photoGridCls}>
            {outing.photos.map((photo) => (
              <div key={photo.id}>
                {/* Photos are served by app/uploads/[filename] from outside public/, so the image optimizer can't serve them. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/uploads/${photo.filename}`}
                  alt={photo.caption || "Outing photo"}
                  className={photoImageCls}
                />
                {photo.caption && (
                  <p className={photoCaptionCls}>{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {isOwner && (
        <Card>
          <PhotoUploader outingId={String(outing.id)} />
        </Card>
      )}
    </div>
  );
}
