-- Fly Fishing Tracker schema — run once against the shared ParkerFreeDB server.
-- Mirrors the flashcards/goodbad/sharpener convention: one SQL schema per
-- app to avoid table-name collisions in the shared database.

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'flyfishing')
    EXEC('CREATE SCHEMA flyfishing');
GO

-- UserId holds the auth-wandering-parker service's cuid()-based User.id.
-- That User table lives in a separate service/database, so there is no
-- local FK here — same pattern as flashcards.Category/Card.
CREATE TABLE flyfishing.Outing (
    OutingId        INT           IDENTITY(1,1) NOT NULL,
    UserId          NVARCHAR(50)  NOT NULL,
    [Date]          DATE          NOT NULL,
    Location        NVARCHAR(200) NOT NULL,
    Caught          INT           NOT NULL CONSTRAINT DF_Outing_Caught DEFAULT (0),
    Lost            INT           NOT NULL CONSTRAINT DF_Outing_Lost DEFAULT (0),
    Missed          INT           NOT NULL CONSTRAINT DF_Outing_Missed DEFAULT (0),
    Score           INT           NOT NULL CONSTRAINT DF_Outing_Score DEFAULT (0),
    Weather         NVARCHAR(100) NULL,
    WaterConditions NVARCHAR(100) NULL,
    WaterTemp       FLOAT         NULL,
    TimeSpentMin    INT           NULL,
    Notes           NVARCHAR(MAX) NULL,
    CreatedAt       DATETIME2     NOT NULL CONSTRAINT DF_Outing_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt       DATETIME2     NOT NULL CONSTRAINT DF_Outing_UpdatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Outing PRIMARY KEY (OutingId)
);
GO

CREATE INDEX IX_Outing_UserId ON flyfishing.Outing (UserId);
GO

-- Cascades on delete: Photo has exactly one parent path (Outing), so unlike
-- flashcards there's no multi-cascade-path conflict to work around.
CREATE TABLE flyfishing.Photo (
    PhotoId  INT           IDENTITY(1,1) NOT NULL,
    OutingId INT           NOT NULL,
    Filename NVARCHAR(255) NOT NULL,
    Caption  NVARCHAR(500) NULL,
    CONSTRAINT PK_Photo PRIMARY KEY (PhotoId),
    CONSTRAINT FK_Outing_Photo FOREIGN KEY (OutingId)
        REFERENCES flyfishing.Outing (OutingId) ON DELETE CASCADE
);
GO

-- Not an auth table — auth lives entirely in auth-wandering-parker. This is
-- a denormalized display-name cache, upserted from the JWT's name/email
-- claim, so the dashboard and /users/[id] page can show a name instead of
-- a raw UserId. PK is UserId itself (the natural key) rather than a
-- surrogate identity column, since this is a 1-row-per-external-user cache.
CREATE TABLE flyfishing.UserProfile (
    UserId      NVARCHAR(50)  NOT NULL,
    DisplayName NVARCHAR(200) NOT NULL,
    CreatedAt   DATETIME2     NOT NULL CONSTRAINT DF_UserProfile_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_UserProfile PRIMARY KEY (UserId)
);
GO
