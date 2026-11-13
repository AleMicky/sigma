-- ============================================================================
-- Migración: V169__add_origen_destino_to_registros_porteria.sql
-- Descripción: Agregar origen_ubicacion_id, destino_ubicacion_id y destino_otro
--              a la tabla registros_porteria.
-- ============================================================================

ALTER TABLE gestion_vehicular.registros_porteria
    ADD COLUMN IF NOT EXISTS origen_ubicacion_id UUID,
    ADD COLUMN IF NOT EXISTS destino_ubicacion_id UUID,
    ADD COLUMN IF NOT EXISTS destino_otro VARCHAR(250);

ALTER TABLE gestion_vehicular.registros_porteria
    ADD CONSTRAINT fk_registro_porteria_origen_ubicacion
        FOREIGN KEY (origen_ubicacion_id) REFERENCES parametros.ubicaciones (id),
    ADD CONSTRAINT fk_registro_porteria_destino_ubicacion
        FOREIGN KEY (destino_ubicacion_id) REFERENCES parametros.ubicaciones (id);

CREATE INDEX IF NOT EXISTS idx_registro_porteria_origen
    ON gestion_vehicular.registros_porteria (origen_ubicacion_id);

CREATE INDEX IF NOT EXISTS idx_registro_porteria_destino
    ON gestion_vehicular.registros_porteria (destino_ubicacion_id);

