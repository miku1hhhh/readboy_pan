CREATE TABLE IF NOT EXISTS history (
  id          TEXT PRIMARY KEY,
  file_name   TEXT NOT NULL,
  remote_url  TEXT,
  upload_time TEXT,
  mode        TEXT,
  file_size   INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_time ON history(upload_time DESC);
CREATE INDEX IF NOT EXISTS idx_url  ON history(remote_url);
