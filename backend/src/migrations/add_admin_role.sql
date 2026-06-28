-- Run only once on existing databases created before these columns were in schema.sql
ALTER TABLE users ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0 AFTER email;

ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL AFTER is_admin,
                 ADD COLUMN reset_token_expires DATETIME NULL AFTER reset_token;
