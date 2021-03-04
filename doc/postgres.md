_[home](../README.md)_

# Postgresql Best Practices 

## Access from node.js

- Use `knex` library to build the sql queries.
- Restrain to use `knex.raw`
- **IMPORTANT SQL INJECTION PREVENTION PATTERN** - When using `knex.raw` make **SURE** to still use **parameterized `knex.raw`** and **NOT encode stored values or user values in the raw string**. This simple approach will avoid any sql injection issue. 


## uuid v4

- **USE type uuid** to store uuid (DO NOT USE text/varchar)
- **USE gen_random_uuid()** to generate uuid v4
- **USE not null and default** for uuid fields

```sql
-- in the create table, call 
CREATE extension IF NOT EXISTS pgcrypto;

-- in table creation use 
CREATE TABLE "user" (
  id bigserial PRIMARY KEY,
  uuid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  username varchar(64) NOT NULL UNIQUE,
  -- password salt for password encryption
  psalt uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
);
```

## Enum - for type

- **USE enum** when a field type can have a fix set of value. 

```sql

-- Define enum
CREATE TYPE ticket_type AS enum ('issue', 'task', 'spec');

-- Use enum as type
CREATE TABLE ticket(
	id bigserial PRIMARY KEY,
	type ticket_type NOT NULL DEFAULT 'issue' -- prefer NOT NULL
);

-- Alter enum
alter type ticket_type add value 'epic';

-- List all enums
\dT+
-- List a specific enum
\dT+ board_type
```

> Note: This should map to the TypeScript type (with the string array / const / technic)
