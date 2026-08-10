import { getPool } from "@/lib/db";
import type {
  Outing,
  OutingDetail,
  OutingInput,
  OutingSortField,
  OutingWithUserName,
  Photo,
  SortDir,
  UserProfile,
} from "@/types";
import type { IDataAccess } from "./IDataAccess";

type OutingRow = {
  OutingId: number;
  UserId: string;
  Date: Date;
  Location: string;
  Caught: number;
  Lost: number;
  Missed: number;
  Score: number;
  Weather: string | null;
  WaterConditions: string | null;
  WaterTemp: number | null;
  TimeSpentMin: number | null;
  Notes: string | null;
  CreatedAt: Date;
  UpdatedAt: Date;
};
type OutingWithDisplayNameRow = OutingRow & { DisplayName: string | null };
type PhotoRow = { PhotoId: number; OutingId: number; Filename: string; Caption: string | null };
type UserProfileRow = { UserId: string; DisplayName: string; CreatedAt: Date };

const OUTING_COLUMNS = `
  o.OutingId, o.UserId, o.[Date], o.Location, o.Caught, o.Lost, o.Missed, o.Score,
  o.Weather, o.WaterConditions, o.WaterTemp, o.TimeSpentMin, o.Notes,
  o.CreatedAt, o.UpdatedAt
`;

const OUTING_OUTPUT_COLUMNS = `
  INSERTED.OutingId, INSERTED.UserId, INSERTED.[Date], INSERTED.Location,
  INSERTED.Caught, INSERTED.Lost, INSERTED.Missed, INSERTED.Score,
  INSERTED.Weather, INSERTED.WaterConditions, INSERTED.WaterTemp,
  INSERTED.TimeSpentMin, INSERTED.Notes, INSERTED.CreatedAt, INSERTED.UpdatedAt
`;

const SORT_COLUMNS: Record<OutingSortField, string> = {
  date: "o.[Date]",
  location: "o.Location",
  score: "o.Score",
  author: "up.DisplayName",
};

// Outing.Date is a pure calendar date (SQL DATE, no time-of-day) and comes
// back from mssql as a Date at UTC midnight. date-fns' format() reads the
// *local* Y/M/D off that instant, so in any timezone behind UTC the day
// displays one day early. Re-anchoring the UTC Y/M/D as a local midnight
// Date fixes display everywhere without each caller needing to know why.
function toLocalDateOnly(value: Date): Date {
  return new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

function toOuting(row: OutingRow): Outing {
  return {
    id: row.OutingId,
    userId: row.UserId,
    date: toLocalDateOnly(row.Date),
    location: row.Location,
    caught: row.Caught,
    lost: row.Lost,
    missed: row.Missed,
    score: row.Score,
    weather: row.Weather,
    waterConditions: row.WaterConditions,
    waterTemp: row.WaterTemp,
    timeSpentMin: row.TimeSpentMin,
    notes: row.Notes,
    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt,
  };
}

function toOutingWithUserName(row: OutingWithDisplayNameRow): OutingWithUserName {
  return { ...toOuting(row), userDisplayName: row.DisplayName ?? row.UserId };
}

function toPhoto(row: PhotoRow): Photo {
  return { id: row.PhotoId, outingId: row.OutingId, filename: row.Filename, caption: row.Caption };
}

function toUserProfile(row: UserProfileRow): UserProfile {
  return { userId: row.UserId, displayName: row.DisplayName, createdAt: row.CreatedAt };
}

export class SqlDataAccess implements IDataAccess {
  // ── Outings ─────────────────────────────────────────────────────────────
  async getAllOutings(
    sortField: OutingSortField = "date",
    sortDir: SortDir = "desc"
  ): Promise<OutingWithUserName[]> {
    const pool = await getPool();
    const column = SORT_COLUMNS[sortField] ?? SORT_COLUMNS.date;
    const direction = sortDir === "asc" ? "ASC" : "DESC";
    const result = await pool.request().query<OutingWithDisplayNameRow>(`
      SELECT ${OUTING_COLUMNS}, up.DisplayName
      FROM flyfishing.Outing o
      LEFT JOIN flyfishing.UserProfile up ON up.UserId = o.UserId
      ORDER BY ${column} ${direction}
    `);
    return result.recordset.map(toOutingWithUserName);
  }

  async getOutingsByUser(userId: string): Promise<Outing[]> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("userId", userId)
      .query<OutingRow>(`
        SELECT ${OUTING_COLUMNS}
        FROM flyfishing.Outing o
        WHERE o.UserId = @userId
        ORDER BY o.[Date] DESC
      `);
    return result.recordset.map(toOuting);
  }

  async getOuting(id: number): Promise<OutingDetail | null> {
    const pool = await getPool();
    const outingResult = await pool
      .request()
      .input("id", id)
      .query<OutingWithDisplayNameRow>(`
        SELECT ${OUTING_COLUMNS}, up.DisplayName
        FROM flyfishing.Outing o
        LEFT JOIN flyfishing.UserProfile up ON up.UserId = o.UserId
        WHERE o.OutingId = @id
      `);
    const row = outingResult.recordset[0];
    if (!row) return null;

    const photosResult = await pool
      .request()
      .input("outingId", id)
      .query<PhotoRow>(`
        SELECT PhotoId, OutingId, Filename, Caption
        FROM flyfishing.Photo
        WHERE OutingId = @outingId
      `);

    return { ...toOutingWithUserName(row), photos: photosResult.recordset.map(toPhoto) };
  }

  async createOuting(userId: string, data: OutingInput): Promise<Outing> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("userId", userId)
      .input("date", data.date)
      .input("location", data.location)
      .input("caught", data.caught)
      .input("lost", data.lost)
      .input("missed", data.missed)
      .input("score", data.score)
      .input("weather", data.weather)
      .input("waterConditions", data.waterConditions)
      .input("waterTemp", data.waterTemp)
      .input("timeSpentMin", data.timeSpentMin)
      .input("notes", data.notes)
      .query<OutingRow>(`
        INSERT INTO flyfishing.Outing (
          UserId, [Date], Location, Caught, Lost, Missed, Score,
          Weather, WaterConditions, WaterTemp, TimeSpentMin, Notes
        )
        OUTPUT ${OUTING_OUTPUT_COLUMNS}
        VALUES (
          @userId, @date, @location, @caught, @lost, @missed, @score,
          @weather, @waterConditions, @waterTemp, @timeSpentMin, @notes
        )
      `);
    return toOuting(result.recordset[0]);
  }

  async updateOuting(userId: string, id: number, data: OutingInput): Promise<Outing> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", id)
      .input("userId", userId)
      .input("date", data.date)
      .input("location", data.location)
      .input("caught", data.caught)
      .input("lost", data.lost)
      .input("missed", data.missed)
      .input("score", data.score)
      .input("weather", data.weather)
      .input("waterConditions", data.waterConditions)
      .input("waterTemp", data.waterTemp)
      .input("timeSpentMin", data.timeSpentMin)
      .input("notes", data.notes)
      .query<OutingRow>(`
        UPDATE flyfishing.Outing SET
          [Date] = @date, Location = @location, Caught = @caught, Lost = @lost,
          Missed = @missed, Score = @score, Weather = @weather,
          WaterConditions = @waterConditions, WaterTemp = @waterTemp,
          TimeSpentMin = @timeSpentMin, Notes = @notes, UpdatedAt = SYSUTCDATETIME()
        OUTPUT ${OUTING_OUTPUT_COLUMNS}
        WHERE OutingId = @id AND UserId = @userId
      `);
    if (!result.recordset[0]) throw new Error(`Outing ${id} not found`);
    return toOuting(result.recordset[0]);
  }

  async deleteOuting(userId: string, id: number): Promise<void> {
    const pool = await getPool();
    // Photo rows cascade automatically (FK_Outing_Photo ON DELETE CASCADE).
    await pool
      .request()
      .input("id", id)
      .input("userId", userId)
      .query(`DELETE FROM flyfishing.Outing WHERE OutingId = @id AND UserId = @userId`);
  }

  // ── Photos ──────────────────────────────────────────────────────────────
  async addPhoto(
    userId: string,
    outingId: number,
    data: { filename: string; caption: string | null }
  ): Promise<Photo> {
    await this.assertOwnsOuting(userId, outingId);
    const pool = await getPool();
    const result = await pool
      .request()
      .input("outingId", outingId)
      .input("filename", data.filename)
      .input("caption", data.caption)
      .query<PhotoRow>(`
        INSERT INTO flyfishing.Photo (OutingId, Filename, Caption)
        OUTPUT INSERTED.PhotoId, INSERTED.OutingId, INSERTED.Filename, INSERTED.Caption
        VALUES (@outingId, @filename, @caption)
      `);
    return toPhoto(result.recordset[0]);
  }

  // ── User profile cache ─────────────────────────────────────────────────
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("userId", userId)
      .query<UserProfileRow>(`
        SELECT UserId, DisplayName, CreatedAt
        FROM flyfishing.UserProfile WHERE UserId = @userId
      `);
    return result.recordset[0] ? toUserProfile(result.recordset[0]) : null;
  }

  async upsertUserProfile(userId: string, displayName: string): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input("userId", userId)
      .input("displayName", displayName)
      .query(`
        MERGE flyfishing.UserProfile AS target
        USING (SELECT @userId AS UserId) AS source
          ON target.UserId = source.UserId
        WHEN MATCHED THEN
          UPDATE SET DisplayName = @displayName
        WHEN NOT MATCHED THEN
          INSERT (UserId, DisplayName) VALUES (@userId, @displayName);
      `);
  }

  // Outing ownership must be re-checked server-side on every photo upload —
  // the client-submitted outingId is otherwise just a number an
  // authenticated user could point at someone else's outing.
  private async assertOwnsOuting(userId: string, outingId: number): Promise<void> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("outingId", outingId)
      .input("userId", userId)
      .query(`
        SELECT OutingId FROM flyfishing.Outing
        WHERE OutingId = @outingId AND UserId = @userId
      `);
    if (result.recordset.length === 0) {
      throw new Error(`Outing ${outingId} not found`);
    }
  }
}
