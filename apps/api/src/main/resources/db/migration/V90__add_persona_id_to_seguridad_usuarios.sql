-- ============================================================================
-- Migración: V90__add_persona_id_to_seguridad_usuarios.sql
-- Descripción: Agregar columna persona_id (FK hacia organizacion.personas)
--              a la tabla seguridad.usuarios.
-- ============================================================================

ALTER TABLE seguridad.usuarios
    ADD COLUMN IF NOT EXISTS persona_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuarios_persona'
    ) THEN
        ALTER TABLE seguridad.usuarios
            ADD CONSTRAINT fk_usuarios_persona
            FOREIGN KEY (persona_id)
            REFERENCES organizacion.personas (id)
            ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_usuarios_persona_id'
    ) THEN
        ALTER TABLE seguridad.usuarios
            ADD CONSTRAINT uk_usuarios_persona_id
            UNIQUE (persona_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_usuarios_persona_id
    ON seguridad.usuarios (persona_id);
