-- Fix UUID default values for existing tables
ALTER TABLE "thread" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "mcp_server" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "attachment" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
