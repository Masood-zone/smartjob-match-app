-- Set the post-migration default after USER has already been added to the enum.
ALTER TABLE "Employer" ALTER COLUMN "role" SET DEFAULT 'USER';