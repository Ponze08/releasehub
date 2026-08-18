/*
  ReleaseHub — SQL Server reference schema
  ----------------------------------------
  The browser demo uses localStorage and the included .NET API uses an in-memory
  repository so the project runs without external infrastructure. This schema
  documents a production-oriented relational model for SQL Server.
*/

CREATE TABLE dbo.Release (
    ReleaseId UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_Release PRIMARY KEY
        CONSTRAINT DF_Release_Id DEFAULT NEWSEQUENTIALID(),
    Application NVARCHAR(100) NOT NULL,
    Version NVARCHAR(30) NOT NULL,
    Environment NVARCHAR(30) NOT NULL,
    Owner NVARCHAR(100) NOT NULL,
    Risk NVARCHAR(20) NOT NULL,
    Status NVARCHAR(30) NOT NULL,
    PlannedDate DATETIMEOFFSET(0) NOT NULL,
    Summary NVARCHAR(500) NOT NULL,
    CreatedAt DATETIMEOFFSET(0) NOT NULL CONSTRAINT DF_Release_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
    UpdatedAt DATETIMEOFFSET(0) NOT NULL CONSTRAINT DF_Release_UpdatedAt DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT CK_Release_Environment CHECK (Environment IN ('Production', 'Staging', 'QA', 'Development')),
    CONSTRAINT CK_Release_Risk CHECK (Risk IN ('Low', 'Medium', 'High')),
    CONSTRAINT CK_Release_Status CHECK (Status IN ('Planned', 'Ready', 'In Progress', 'Completed', 'Failed'))
);
GO

CREATE INDEX IX_Release_PlannedDate ON dbo.Release (PlannedDate DESC);
CREATE INDEX IX_Release_Status_Environment ON dbo.Release (Status, Environment) INCLUDE (Application, Version, Risk, Owner);
GO

CREATE TABLE dbo.ReleaseActivity (
    ActivityId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ReleaseActivity PRIMARY KEY,
    ReleaseId UNIQUEIDENTIFIER NULL,
    ActivityType NVARCHAR(30) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Detail NVARCHAR(500) NOT NULL,
    Actor NVARCHAR(100) NOT NULL,
    CreatedAt DATETIMEOFFSET(0) NOT NULL CONSTRAINT DF_ReleaseActivity_CreatedAt DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT FK_ReleaseActivity_Release FOREIGN KEY (ReleaseId)
        REFERENCES dbo.Release (ReleaseId)
        ON DELETE SET NULL,
    CONSTRAINT CK_ReleaseActivity_Type CHECK (ActivityType IN ('Created', 'Updated', 'Status', 'Deleted'))
);
GO

CREATE INDEX IX_ReleaseActivity_CreatedAt ON dbo.ReleaseActivity (CreatedAt DESC);
CREATE INDEX IX_ReleaseActivity_ReleaseId ON dbo.ReleaseActivity (ReleaseId, CreatedAt DESC);
GO

/* Example reporting query used by a dashboard service. */
SELECT
    Status,
    Environment,
    COUNT_BIG(*) AS ReleaseCount
FROM dbo.Release
GROUP BY Status, Environment
ORDER BY Environment, Status;
GO
