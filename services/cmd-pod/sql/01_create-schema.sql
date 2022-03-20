

-- #region:    --- User

-- Global user roles
CREATE TYPE user_role AS ENUM (
  'r_sys',
  'r_user'
);

-- user access modifiers, with their negatives
CREATE TYPE user_access AS ENUM (
  'a_ui',
  '!a_ui',
  'a_api',
  '!a_api',
  'a_orgs_list',
  '!a_orgs_list',
  'a_orgs_create',
  '!a_orgs_create',
  'a_orgs_update',
  '!a_orgs_update',    
  'a_orgs_delete',
  '!a_orgs_delete',    
  'a_self_profile_edit',
  '!a_self_profile_edit'
);

CREATE TABLE "user" (
  id bigserial PRIMARY KEY,
  uuid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid (),
  username varchar(64) NOT NULL UNIQUE,
  "fullName" varchar(128) NOT NULL UNIQUE,

  -- global roles
  ROLE user_role NOT NULL DEFAULT 'r_user',
  -- access modifiers
  accesses user_access[],

  -- password salt for password encryption
  pwd varchar(128),
  psalt uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  "pwdHistory" varchar(128)[],

  -- token salt for session cookie
  tsalt uuid NOT NULL UNIQUE DEFAULT gen_random_uuid (),

  -- timestamps
  cid bigint,
  ctime timestamp with time zone,
  mid bigint,
  mtime timestamp with time zone
);
-- reserving for 1000 for dev, test, and administrative purproses.
ALTER SEQUENCE user_id_seq
  RESTART WITH 1000;


-- password reset link
CREATE TABLE "prlink" (
  id bigserial,
  "userId" bigint NOT NULL UNIQUE,
  code uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  "clickFirst" timestamp with time zone,
  "clickLast" timestamp with time zone,
  "clickCount" int,

  FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE CASCADE
);
-- #endregion: --- User

-- #region:    --- OAuth
CREATE TYPE oauth_type AS ENUM (
  'google',
  'github'
);

CREATE TABLE oauth (
  id bigserial PRIMARY KEY,
  TYPE oauth_type NOT NULL DEFAULT 'google',
  "userId" bigint NOT NULL,
  oauth_id varchar(128),
  oauth_name varchar(64),
  oauth_username varchar(64),
  oauth_token varchar(256),
  oauth_picture varchar(128),
  -- timestamps 
  cid bigint,
  ctime timestamp with time zone,  
  mid bigint,
  mtime timestamp with time zone,
  -- rels    
  FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE CASCADE
);

ALTER SEQUENCE oauth_id_seq
  RESTART WITH 1000;
-- #endregion: --- OAuth


-- #region:    --- Org
CREATE TYPE org_role_name AS ENUM (
  'org_r_owner',
  'org_r_admin',
  'org_r_editor',
  'org_r_viewer'
);

CREATE TYPE org_access AS ENUM (
  'org_a_ui',
  '!org_a_ui',
  'org_a_api',
  '!org_a_api',
  'org_a_orgs_list',
  '!org_a_orgs_list',
  'org_a_orgs_create',
  '!org_a_orgs_create',
  'org_a_orgs_update',
  '!org_a_orgs_update',    
  'org_a_orgs_delete',
  '!org_a_orgs_delete',    
  'org_a_self_profile_edit',
  '!org_a_self_profile_edit'
);


CREATE TYPE org_type AS ENUM (
  'personal',
  'group'
);

CREATE TABLE "org" (
  id bigserial PRIMARY KEY,
  uuid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  type org_type NOT NULL DEFAULT 'personal',
  name varchar(64), 

  -- timestamps 
  cid bigint,
  ctime timestamp with time zone,  
  mid bigint,
  mtime timestamp with time zone
);
ALTER SEQUENCE org_id_seq
  RESTART WITH 1000;

CREATE TABLE "org_user" (
  "userId" bigint NOT NULL,
  "orgId" bigint NOT NULL,
  "role" org_role_name NOT NULL,

  -- timestamps 
  cid bigint,
  ctime timestamp with time zone,  
  mid bigint,
  mtime timestamp with time zone,

  -- rels  
  PRIMARY KEY ("userId", "orgId"),
  FOREIGN KEY ("userId") REFERENCES "user" (id) ON DELETE CASCADE,
  FOREIGN KEY ("orgId") REFERENCES "org" (id) ON DELETE CASCADE
);
-- #endregion: --- Org

-- #region:    --- Project
CREATE TABLE "project" (
  id bigserial PRIMARY KEY,
  "orgId" bigint NOT NULL,  
  uuid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid (),
  name varchar(64) NOT NULL ,

  -- timestamps 
  cid bigint,
  ctime timestamp with time zone,
  mid bigint,
  mtime timestamp with time zone
);

ALTER SEQUENCE project_id_seq
  RESTART WITH 1000;
-- #endregion: --- Project


-- #region:    --- Ticket
CREATE TABLE "ticket" (  
  id bigserial PRIMARY KEY,
  "orgId" bigint NOT NULL,  
  uuid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid (),
  title varchar(64),
  "desc" text,

  -- timestamps 
  cid bigint,
  ctime timestamp with time zone,
  mid bigint,
  mtime timestamp with time zone
);

ALTER SEQUENCE ticket_id_seq
  RESTART WITH 1000;

CREATE TABLE "ticket_project" (
  "ticketId" bigint NOT NULL,
  "projectId" bigint NOT NULL,

  -- timestamps 
  cid bigint,
  ctime timestamp with time zone,  
  mid bigint,
  mtime timestamp with time zone,

  -- rels  
  PRIMARY KEY ("ticketId", "projectId"),
  FOREIGN KEY ("ticketId") REFERENCES "ticket" (id) ON DELETE CASCADE,
  FOREIGN KEY ("projectId") REFERENCES "project" (id) ON DELETE CASCADE
);  
-- #endregion: --- Ticket

-- #region:    --- Label
CREATE TABLE "label" (  
  id bigserial PRIMARY KEY,
  "orgId" bigint NOT NULL,  
  name varchar(64),

  -- timestamps 
  cid bigint,
  ctime timestamp with time zone,
  mid bigint,
  mtime timestamp with time zone
);

ALTER SEQUENCE label_id_seq
  RESTART WITH 1000;

CREATE TABLE "label_ticket" (
  "labelId" bigint NOT NULL,
  "ticketId" bigint NOT NULL,

  -- timestamps 
  cid bigint,
  ctime timestamp with time zone,  
  mid bigint,
  mtime timestamp with time zone,

  -- rels  
  PRIMARY KEY ("labelId", "ticketId"),
  FOREIGN KEY ("labelId") REFERENCES "label" (id) ON DELETE CASCADE,
  FOREIGN KEY ("ticketId") REFERENCES "ticket" (id) ON DELETE CASCADE
);    
-- #endregion: --- Label

-- #region:    --- Media
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
  "orgId" bigint NOT NULL,  
  uuid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid (),
  type media_type NOT NULL,
  name varchar(64),

  "srcName" varchar(64),
  "folderPath" varchar(256),

  "resList" media_res[], -- available res list

  sd media_res, -- the low definition suffix like '480p60' (must be available in s3)

  -- timestamps 
  cid bigint,
  ctime timestamp with time zone,
  mid bigint,
  mtime timestamp with time zone,

  -- rels
  FOREIGN KEY ("orgId") REFERENCES "org" (id) ON DELETE CASCADE
);

ALTER SEQUENCE media_id_seq
  RESTART WITH 1000;


-- #endregion: --- Media

-- #region:    --- Job
CREATE TYPE job_state AS ENUM (
  'new',
  'started',
  'completed',
  'failed'
);

-- org jobs only (orgId must be true)
CREATE TABLE "job" (

  id bigserial PRIMARY KEY,
  "orgId" bigint NOT NULL,  
  state job_state DEFAULT 'new',

  event varchar(64) NOT NULL,

  "onEntity" varchar(64),
  "onId" bigint,

  "newTime" timestamp with time zone,
  "startTime" timestamp with time zone, -- when start processing
  "endTime" timestamp with time zone, -- for completed or failed

  "ntd" boolean DEFAULT false, -- nothing to do
  
  todo jsonb, -- could/should be json-rpc request
  done jsonb, -- could/should be json-rpc response success
  progress jsonb, -- could/should be array of statuses

  error varchar(64), -- should/should be json-rpc 
  err_msg text,
  
  FOREIGN KEY ("orgId") REFERENCES "org" (id) ON DELETE CASCADE
);

ALTER SEQUENCE job_id_seq
  RESTART WITH 1000;
-- #endregion: --- Job



