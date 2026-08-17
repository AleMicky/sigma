ALTER TABLE inventarios.insumos DROP CONSTRAINT IF EXISTS fk_insumos_tipo_insumo;
DROP INDEX IF EXISTS inventarios.idx_insumos_tipo_insumo_id;
ALTER TABLE inventarios.insumos DROP COLUMN IF EXISTS tipo_insumo_id;
