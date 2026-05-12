-- Globally unique site name (case-insensitive, trimmed).
CREATE UNIQUE INDEX "Site_name_lower_trim_unique" ON "Site" (LOWER(TRIM("name")));
