-- Fly Fishing Tracker — 40 mock outings for the real guest account.
-- Run against the shared ParkerFreeDB server AFTER schema.sql has created the
-- flyfishing schema. Safe to review first, then execute.
--
-- Unlike seed-mock-data.sql, this UserId is a REAL, loggable-in account
-- (guest@wanderingparker.com in the auth-wandering-parker User table), not a
-- disposable 'cmock' fake. Its UserId is 32 there (an int, despite the
-- cuid()-based comment on flyfishing.Outing — that assumption is stale for
-- this account). Cleanup/guard below is scoped to UserId = '32' only and
-- never touches 'cmock%' rows.
--
-- Outing count is fixed at 40 (not randomized). Locations, catch numbers and
-- conditions are randomized at execution time via CHECKSUM(NEWID()).
-- Re-running is guarded so it will not duplicate.

SET NOCOUNT ON;

DECLARE @GuestUserId NVARCHAR(50) = '32';

/* ---------------------------------------------------------------------------
   RE-RUN CLEANUP (optional) — uncomment to wipe ONLY the guest's outings
   before re-seeding. Scoped to @GuestUserId, never 'cmock%' or other users.

   DELETE ph
     FROM flyfishing.Photo ph
     JOIN flyfishing.Outing o ON o.OutingId = ph.OutingId
    WHERE o.UserId = @GuestUserId;
   DELETE FROM flyfishing.Outing WHERE UserId = @GuestUserId;
--------------------------------------------------------------------------- */

-- ---------------------------------------------------------------------------
-- Lookup pools — same as seed-mock-data.sql, so the guest's data matches the
-- look of the other mock fishermen. Weather/WaterConditions are drawn only
-- from the app's own enums (src/lib/constants.ts).
-- ---------------------------------------------------------------------------
DECLARE @Location TABLE (LocId INT NOT NULL PRIMARY KEY, Location NVARCHAR(200) NOT NULL);
INSERT INTO @Location (LocId, Location) VALUES
    (1,  'South Platte River - Deckers, CO'),
    (2,  'Fryingpan River - Basalt, CO'),
    (3,  'Roaring Fork River - Aspen, CO'),
    (4,  'Arkansas River - Browns Canyon, CO'),
    (5,  'Blue River - Silverthorne, CO'),
    (6,  'Gunnison River - Black Canyon, CO'),
    (7,  'Madison River - Ennis, MT'),
    (8,  'Missouri River - Craig, MT'),
    (9,  'Bighorn River - Fort Smith, MT'),
    (10, 'Yellowstone River - Paradise Valley, MT'),
    (11, 'Gallatin River - Big Sky, MT'),
    (12, 'Beaverhead River - Dillon, MT');

DECLARE @Weather TABLE (WthId INT NOT NULL PRIMARY KEY, Weather NVARCHAR(100) NOT NULL);
INSERT INTO @Weather (WthId, Weather) VALUES
    (1, 'Sunny'),
    (2, 'Partly Cloudy'),
    (3, 'Cloudy'),
    (4, 'Light Rain'),
    (5, 'Rain'),
    (6, 'Snow'),
    (7, 'Windy'),
    (8, 'Foggy');

DECLARE @Water TABLE (WtrId INT NOT NULL PRIMARY KEY, WaterConditions NVARCHAR(100) NOT NULL);
INSERT INTO @Water (WtrId, WaterConditions) VALUES
    (1, 'Clear'),
    (2, 'Slightly Stained'),
    (3, 'Stained'),
    (4, 'Murky'),
    (5, 'High Water'),
    (6, 'Normal Flow'),
    (7, 'Low Water');

DECLARE @Note TABLE (NoteId INT NOT NULL PRIMARY KEY, Note NVARCHAR(500) NOT NULL);
INSERT INTO @Note (NoteId, Note) VALUES
    (1, 'Fish keyed on a size 18 BWO dropper most of the day.'),
    (2, 'Slow start, then the hatch came off around noon and it turned on.'),
    (3, 'Best fish came tight to the bank on a streamer.'),
    (4, 'Crowded access, had to hike upstream to find open water.'),
    (5, 'Dialed in a hopper-dropper rig once the sun was high.'),
    (6, 'Cold morning, numbers picked up as the water warmed.');

DECLARE @LocCount  INT = (SELECT COUNT(*) FROM @Location);
DECLARE @WthCount  INT = (SELECT COUNT(*) FROM @Weather);
DECLARE @WtrCount  INT = (SELECT COUNT(*) FROM @Water);
DECLARE @NoteCount INT = (SELECT COUNT(*) FROM @Note);

-- ---------------------------------------------------------------------------
-- Outings: exactly 40 rows via a 1..40 tally. Catch numbers are materialized
-- once per row in a CROSS APPLY so Score can be derived with the app's own
-- formula (caught*5 + lost*3 + missed*1, see src/lib/scoring.ts). Guarded so
-- a second run won't double-seed; clear the guest's rows first (cleanup block
-- above) to regenerate.
-- ---------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM flyfishing.Outing WHERE UserId = @GuestUserId)
BEGIN
    ;WITH Tally AS (
        SELECT 1 AS n
        UNION ALL
        SELECT n + 1 FROM Tally WHERE n < 40
    )
    INSERT INTO flyfishing.Outing (
        UserId, [Date], Location, Caught, Lost, Missed, Score,
        Weather, WaterConditions, WaterTemp, TimeSpentMin, Notes)
    SELECT
        @GuestUserId,
        -- Random day within the past 2 years; offset 0 = today, never future.
        DATEADD(DAY, -ABS(CHECKSUM(NEWID()) % 730), CAST(SYSUTCDATETIME() AS DATE)),
        (SELECT l.Location FROM @Location l WHERE l.LocId = 1 + ABS(CHECKSUM(NEWID()) % @LocCount)),
        clm.Caught,
        clm.Lost,
        clm.Missed,
        clm.Caught * 5 + clm.Lost * 3 + clm.Missed * 1,
        (SELECT w.Weather FROM @Weather w WHERE w.WthId = 1 + ABS(CHECKSUM(NEWID()) % @WthCount)),
        (SELECT wc.WaterConditions FROM @Water wc WHERE wc.WtrId = 1 + ABS(CHECKSUM(NEWID()) % @WtrCount)),
        38 + ABS(CHECKSUM(NEWID()) % 250) / 10.0,   -- 38.0 - 62.9 °F
        90 + ABS(CHECKSUM(NEWID()) % 271),          -- 90 - 360 minutes
        CASE WHEN ABS(CHECKSUM(NEWID()) % 2) = 0 THEN NULL
             ELSE (SELECT nt.Note FROM @Note nt WHERE nt.NoteId = 1 + ABS(CHECKSUM(NEWID()) % @NoteCount))
        END
      FROM Tally t
      CROSS APPLY (
            SELECT
                Caught = ABS(CHECKSUM(NEWID()) % 13),   -- 0 - 12
                Lost   = ABS(CHECKSUM(NEWID()) % 7),    -- 0 - 6
                Missed = ABS(CHECKSUM(NEWID()) % 9)     -- 0 - 8
      ) clm;

    PRINT CONCAT('Seeded ', @@ROWCOUNT, ' outings for the guest account (UserId = 32).');
END
ELSE
    PRINT 'Guest outings already exist (UserId = 32); nothing inserted. Run the cleanup block to regenerate.';
