-- Fly Fishing Tracker — mock seed data (10 fictitious fishermen).
-- Run against the shared ParkerFreeDB server AFTER schema.sql has created the
-- flyfishing schema. Safe to review first, then execute.
--
-- Every mock UserId is prefixed 'cmock' so this data is easy to spot and to
-- remove. These ids do NOT correspond to real auth-wandering-parker accounts,
-- so these users cannot log in — they exist only to populate the dashboard,
-- /users/[id] pages and the reports charts with realistic-looking history.
--
-- Outing counts, dates, locations, catch numbers and conditions are randomized
-- at execution time via CHECKSUM(NEWID()). Each run therefore produces
-- different outings; re-running is guarded so it will not duplicate.

SET NOCOUNT ON;

/* ---------------------------------------------------------------------------
   RE-RUN CLEANUP (optional) — uncomment to wipe ONLY the mock users and their
   data before re-seeding. The 'cmock%' filter never touches real accounts.

   DELETE ph
     FROM flyfishing.Photo ph
     JOIN flyfishing.Outing o ON o.OutingId = ph.OutingId
    WHERE o.UserId LIKE 'cmock%';
   DELETE FROM flyfishing.Outing      WHERE UserId LIKE 'cmock%';
   DELETE FROM flyfishing.UserProfile WHERE UserId LIKE 'cmock%';
--------------------------------------------------------------------------- */

-- ---------------------------------------------------------------------------
-- The 10 fishermen: last 10 U.S. presidents, newest to oldest. OutingCount is
-- rolled per user in [15, 50]. ABS(CHECKSUM(NEWID()) % N) keeps the modulo
-- inside ABS so CHECKSUM's INT_MIN edge case can never overflow.
-- ---------------------------------------------------------------------------
DECLARE @Users TABLE (
    UserId      NVARCHAR(50)  NOT NULL PRIMARY KEY,
    DisplayName NVARCHAR(200) NOT NULL,
    OutingCount INT           NOT NULL
);

INSERT INTO @Users (UserId, DisplayName, OutingCount) VALUES
    ('cmockbiden000000000000001', 'Joe Biden',         15 + ABS(CHECKSUM(NEWID()) % 36)),
    ('cmocktrump000000000000002', 'Donald Trump',       15 + ABS(CHECKSUM(NEWID()) % 36)),
    ('cmockobama000000000000003', 'Barack Obama',       15 + ABS(CHECKSUM(NEWID()) % 36)),
    ('cmockbushgw00000000000004', 'George W. Bush',     15 + ABS(CHECKSUM(NEWID()) % 36)),
    ('cmockclinton0000000000005', 'Bill Clinton',       15 + ABS(CHECKSUM(NEWID()) % 36)),
    ('cmockbushghw0000000000006', 'George H. W. Bush',  15 + ABS(CHECKSUM(NEWID()) % 36)),
    ('cmockreagan00000000000007', 'Ronald Reagan',      15 + ABS(CHECKSUM(NEWID()) % 36)),
    ('cmockcarter00000000000008', 'Jimmy Carter',       15 + ABS(CHECKSUM(NEWID()) % 36)),
    ('cmockford0000000000000009', 'Gerald Ford',        15 + ABS(CHECKSUM(NEWID()) % 36)),
    ('cmocknixon000000000000010', 'Richard Nixon',      15 + ABS(CHECKSUM(NEWID()) % 36));

-- ---------------------------------------------------------------------------
-- Lookup pools. Locations are famous CO / MT blue-ribbon water. Weather and
-- WaterConditions are drawn only from the app's own enums (src/lib/constants).
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
-- UserProfile: the denormalized display-name cache. Insert only the mock users
-- that aren't already present, so this block is safe to re-run.
-- ---------------------------------------------------------------------------
INSERT INTO flyfishing.UserProfile (UserId, DisplayName)
SELECT u.UserId, u.DisplayName
  FROM @Users u
 WHERE NOT EXISTS (
       SELECT 1 FROM flyfishing.UserProfile p WHERE p.UserId = u.UserId);

-- ---------------------------------------------------------------------------
-- Outings: generate OutingCount rows per user by joining each user to a 1..50
-- tally and keeping tally.n <= OutingCount. Catch numbers are materialized once
-- per row in a CROSS APPLY so Score can be derived from them with the app's own
-- formula (caught*5 + lost*3 + missed*1, see src/lib/scoring.ts). Guarded so a
-- second run won't double-seed; clear the mock rows first (cleanup block above)
-- to regenerate.
-- ---------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM flyfishing.Outing WHERE UserId LIKE 'cmock%')
BEGIN
    ;WITH Tally AS (
        SELECT 1 AS n
        UNION ALL
        SELECT n + 1 FROM Tally WHERE n < 50
    )
    INSERT INTO flyfishing.Outing (
        UserId, [Date], Location, Caught, Lost, Missed, Score,
        Weather, WaterConditions, WaterTemp, TimeSpentMin, Notes)
    SELECT
        u.UserId,
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
      FROM @Users u
      JOIN Tally t ON t.n <= u.OutingCount
      CROSS APPLY (
            SELECT
                Caught = ABS(CHECKSUM(NEWID()) % 13),   -- 0 - 12
                Lost   = ABS(CHECKSUM(NEWID()) % 7),    -- 0 - 6
                Missed = ABS(CHECKSUM(NEWID()) % 9)     -- 0 - 8
      ) clm;

    PRINT CONCAT('Seeded ', @@ROWCOUNT, ' outings across 10 mock fishermen.');
END
ELSE
    PRINT 'Mock outings already exist (UserId LIKE ''cmock%''); nothing inserted. Run the cleanup block to regenerate.';
