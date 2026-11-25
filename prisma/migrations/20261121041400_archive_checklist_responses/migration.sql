-- Add an optional archive timestamp to worker checklist responses.
ALTER TABLE "ChecklistResponse" ADD COLUMN "archivedAt" TIMESTAMP(3);
