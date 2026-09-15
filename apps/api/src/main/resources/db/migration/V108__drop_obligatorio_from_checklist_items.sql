-- Drop column obligatorio from checklist_items if it exists
ALTER TABLE mantenimientos.checklist_items
    DROP COLUMN IF EXISTS obligatorio;
