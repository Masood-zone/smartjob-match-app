-- AlterTable
ALTER TABLE "algorithm_config" ADD COLUMN     "allowOverqualified" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowUnderqualified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minimumSkillMatchPercent" INTEGER NOT NULL DEFAULT 40;
