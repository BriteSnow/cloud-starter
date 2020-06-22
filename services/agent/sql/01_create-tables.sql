-- for uuid v4 gen_randome_uuid()
CREATE extension IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('r_admin', 'r_user');

-- user access modifiers, with their negatives
CREATE TYPE user_access AS ENUM (
  'a_ui', '!a_ui', 
  'a_api', '!a_api', 
  'a_admin', '!a_admin', 
  'a_admin_edit_user', '!a_admin_edit_user');

CREATE TABLE "user" (
  id bigserial PRIMARY KEY,
  uuid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  username varchar(64) NOT NULL UNIQUE,
  -- global roles
  role user_role NOT NULL DEFAULT 'r_user',
  -- access modifiers
  accesses user_access[], 
  -- password salt for password encryption
  psalt uuid NOT NULL UNIQUE  DEFAULT gen_random_uuid(),
  pwd varchar(128),
  -- token salt for session cookie
  tsalt uuid NOT NULL UNIQUE  DEFAULT gen_random_uuid(),
  cid bigint, 
  ctime timestamp with time zone,
  mid bigint, 
  mtime timestamp with time zone
);
-- reserving for 1000 for dev, test, and administrative purproses.
ALTER SEQUENCE user_id_seq RESTART WITH 1000;


CREATE TYPE oauth_type AS ENUM ('google');
CREATE TABLE oauth (
  id bigserial PRIMARY KEY,
  type oauth_type NOT NULL DEFAULT 'google',
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
  FOREIGN KEY ("userId") REFERENCES "user" (id) on delete cascade
);
ALTER SEQUENCE oauth_id_seq RESTART WITH 1000;


CREATE TYPE job_state AS ENUM ('new', 'queued', 'processing', 'completed', 'failed');
CREATE TABLE job (
  id bigserial PRIMARY KEY,
  "newTime" timestamp with time zone,
  "queuedTime" timestamp with time zone,
  "processingTime" timestamp with time zone,
  "completedTime" timestamp with time zone,
  "failedTime" timestamp with time zone,
  "name" varchar(32),
  state job_state default 'new',
  data jsonb,
  result jsonb,
  error text
);


CREATE TABLE "project" (
  id bigserial PRIMARY KEY,
  cid bigint, 
  ctime timestamp with time zone,
  mid bigint, 
  mtime timestamp with time zone,  
  name varchar(64)
);
ALTER SEQUENCE project_id_seq RESTART WITH 1000;



CREATE TYPE prole_name AS ENUM (
	'pr_owner',
	'pr_admin',
	'pr_member',
	'pr_viewer');

CREATE TABLE "user_prole" (
  "userId" bigint NOT NULL,
  "projectId" bigint NOT NULL,
  "role" prole_name NOT NULL,
  PRIMARY KEY("userId", "projectId"),
  FOREIGN KEY ("userId") REFERENCES "user" (id) on delete cascade,
  FOREIGN KEY ("projectId") REFERENCES "project" (id) on delete cascade
);


CREATE TABLE "task" (
  id bigserial PRIMARY KEY,
  cid bigint, 
  ctime timestamp with time zone,
  mid bigint, 
  mtime timestamp with time zone,
  started boolean default false,
  completed boolean default false,
  "projectId" bigint NOT NULL,
  title varchar(128), 
  FOREIGN KEY ("projectId") REFERENCES "project" (id) on delete cascade
);
ALTER SEQUENCE task_id_seq RESTART WITH 1000;

CREATE TABLE "label" (
  id bigserial PRIMARY KEY,
  cid bigint, 
  ctime timestamp with time zone,
  mid bigint, 
  mtime timestamp with time zone,    
  "projectId" bigint NOT NULL,
  name varchar(128), 
  color varchar(32)
);
ALTER SEQUENCE label_id_seq RESTART WITH 1000;


CREATE TABLE "task_label" (
  "taskId" bigint NOT NULL,
  "labelId" bigint NOT NULL,
  cid bigint, 
  ctime timestamp with time zone,
  mid bigint, 
  mtime timestamp with time zone,    
  PRIMARY KEY("taskId", "labelId"),
  FOREIGN KEY ("taskId") REFERENCES "task" (id) on delete cascade,
  FOREIGN KEY ("labelId") REFERENCES "label" (id) on delete cascade
);