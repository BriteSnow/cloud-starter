
-- Seed the admin and demo users
-- Note: the uuid, psalt, tsalt will be generated by default, and pwd will be set by the cmd-pod recreeateDb/resetPassword ts script

INSERT INTO "user" (id, role, username) VALUES (1, 'r_sys', 'sysadmin');

INSERT INTO "user" (id, role, username) VALUES (2, 'r_user', 'demo1');