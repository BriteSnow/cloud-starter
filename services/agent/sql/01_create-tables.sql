
CREATE TABLE config ( 
  "name" varchar(32) PRIMARY KEY, 
  data jsonb
);

CREATE TABLE "user" (
  id bigserial PRIMARY KEY,
  uuid uuid NOT NULL UNIQUE,
  salt varchar(128) NOT NULL UNIQUE,
  type varchar(16) NOT NULL,
  cid bigint, 
  ctime timestamp with time zone,
  mid bigint, 
  mtime timestamp with time zone,    
  username varchar(64), 
  pwd varchar(128),
  key varchar(128),

);
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


CREATE TABLE "user_prole" (
  "userId" bigint NOT NULL,
  "projectId" bigint NOT NULL,
  "name" varchar(32) NOT NULL,
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