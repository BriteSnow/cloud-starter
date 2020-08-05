-- for uuid v4 gen_randome_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM (
  'r_admin',
  'r_user'
);

-- user access modifiers, with their negatives
CREATE TYPE user_access AS ENUM (
  'a_ui',
  '!a_ui',
  'a_api',
  '!a_api',
  'a_admin',
  '!a_admin',
  'a_admin_edit_user',
  '!a_admin_edit_user'
);

CREATE TABLE "user" (
  id bigserial PRIMARY KEY,
  uuid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid (),
  username varchar(64) NOT NULL UNIQUE,
  -- global roles
  ROLE user_role NOT NULL DEFAULT 'r_user',
  -- access modifiers
  accesses user_access[],
  -- password salt for password encryption
  psalt uuid NOT NULL UNIQUE DEFAULT gen_random_uuid (),
  pwd varchar(128),
  -- token salt for session cookie
  tsalt uuid NOT NULL UNIQUE DEFAULT gen_random_uuid (),
  cid bigint,
  ctime timestamp with time zone,
  mid bigint,
  mtime timestamp with time zone
);

-- reserving for 1000 for dev, test, and administrative purproses.
ALTER SEQUENCE user_id_seq
  RESTART WITH 1000;

CREATE TYPE oauth_type AS ENUM (
  'google'
);

CREATE TABLE oauth (
  id bigserial PRIMARY KEY,
  TYPE oauth_type NOT NULL DEFAULT 'google',
  cid bigint,
  ctime timestamp with time zone,
  mid bigint,
  mtime timestamp with time zone,
  "userId" bigint NOT NULL,
  oauth_id varchar(128),
  oauth_name varchar(64),
  oauth_username varchar(64),
  oauth_token varchar(256),
  oauth_picture varchar(128),
  FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE CASCADE
);

ALTER SEQUENCE oauth_id_seq
  RESTART WITH 1000;

CREATE TABLE "wks" (
  id bigserial PRIMARY KEY,
  uuid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid (),
  cid bigint,
  ctime timestamp with time zone,
  mid bigint,
  mtime timestamp with time zone,
  name varchar(64)
);

ALTER SEQUENCE wks_id_seq
  RESTART WITH 1000;

CREATE TYPE media_type AS ENUM (
  'image',
  'video'
);

CREATE TYPE media_res AS ENUM (
  '480p30',
  '360p30'
);

CREATE TABLE "media" (
  id bigserial PRIMARY KEY,
  uuid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid (),
  cid bigint,
  ctime timestamp with time zone,
  mid bigint,
  mtime timestamp with time zone,
  "wksId" bigint NOT NULL,
  TYPE media_type NOT NULL,
  "srcName" varchar(64),
  name varchar(64),
  "folderPath" varchar(256),
  "resList" media_res[], -- available res list
  sd media_res, -- the low definition suffix like '480p60' (must be available in s3)
  FOREIGN KEY ("wksId") REFERENCES "wks" (id) ON DELETE CASCADE
);

ALTER SEQUENCE media_id_seq
  RESTART WITH 1000;

CREATE TYPE wrole_name AS ENUM (
  'wr_owner',
  'wr_admin',
  'wr_editor',
  'wr_viewer'
);

CREATE TABLE "user_wks" (
  "userId" bigint NOT NULL,
  "wksId" bigint NOT NULL,
  "role" wrole_name NOT NULL,
  PRIMARY KEY ("userId", "wksId"),
  FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE CASCADE,
  FOREIGN KEY ("wksId") REFERENCES "wks" (id) ON DELETE CASCADE
);

CREATE TABLE "label" (
  id bigserial PRIMARY KEY,
  cid bigint,
  ctime timestamp with time zone,
  mid bigint,
  mtime timestamp with time zone,
  "wksId" bigint NOT NULL,
  name varchar(128),
  color varchar(32),
  FOREIGN KEY ("wksId") REFERENCES "wks" (id) ON DELETE CASCADE
);

ALTER SEQUENCE label_id_seq
  RESTART WITH 1000;


CREATE TYPE job_state AS ENUM (
  'new',
  'started',
  'completed',
  'failed'
);


CREATE TABLE "job" (

  id bigserial PRIMARY KEY,
  state job_state DEFAULT 'new',

  event varchar(64) NOT NULL,

  "wksId" bigint, -- can be null
  "onEntity" varchar(64),
  "onId" bigint,

  "newTime" timestamp with time zone,
  "startTime" timestamp with time zone, -- when start processing
  "endTime" timestamp with time zone, -- for completed or failed

  "ntd" boolean DEFAULT false, -- nothing to do
  
  todo jsonb,
  done jsonb,
  progress jsonb,

  err_code varchar(64),
  err_msg text,
  
  FOREIGN KEY ("wksId") REFERENCES "wks" (id) ON DELETE CASCADE
);

ALTER SEQUENCE label_id_seq
  RESTART WITH 1000;

