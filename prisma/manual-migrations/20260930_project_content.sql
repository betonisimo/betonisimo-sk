-- Additive change only. Run once on the intended database before deploying this version.
-- Deliberately outside Prisma's incomplete historical migration chain.
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "content" JSONB;
