-- ============================================================================
-- Migración: V128__refactor_conductores_and_create_conductor_licencias.sql
-- Descripción: Refactorizar conductores a maestro-detalle con tabla conductor_licencias
-- ============================================================================

-- 1. Crear la tabla de conductor_licencias
CREATE TABLE IF NOT EXISTS gestion_vehicular.conductor_licencias (
    id                  UUID            PRIMARY KEY,
    conductor_id        UUID            NOT NULL REFERENCES gestion_vehicular.conductores(id) ON DELETE CASCADE,
    categoria_licencia  VARCHAR(20)     NOT NULL,
    numero_licencia     VARCHAR(100)    NOT NULL,
    fecha_emision       DATE            NOT NULL,
    fecha_vencimiento   DATE            NOT NULL,
    estado              VARCHAR(30)     NOT NULL DEFAULT 'VIGENTE',
    nombre_archivo      VARCHAR(255),
    nombre_original     VARCHAR(255),
    url                 VARCHAR(1000),
    mime_type           VARCHAR(100),
    size                BIGINT,
    observacion         VARCHAR(1000),
    activo              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ     NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    created_by_id       UUID,
    updated_by_id       UUID
);

CREATE INDEX IF NOT EXISTS idx_conductor_licencia_conductor
    ON gestion_vehicular.conductor_licencias (conductor_id);

CREATE INDEX IF NOT EXISTS idx_conductor_licencia_estado
    ON gestion_vehicular.conductor_licencias (estado);

CREATE INDEX IF NOT EXISTS idx_conductor_licencia_vencimiento
    ON gestion_vehicular.conductor_licencias (fecha_vencimiento);

CREATE INDEX IF NOT EXISTS idx_conductor_licencia_numero
    ON gestion_vehicular.conductor_licencias (numero_licencia);

-- 2. Migrar licencias existentes de la tabla conductores si existen columnas previas
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'gestion_vehicular' 
          AND table_name = 'conductores' 
          AND column_name = 'numero_licencia'
    ) THEN
        INSERT INTO gestion_vehicular.conductor_licencias (
            id,
            conductor_id,
            categoria_licencia,
            numero_licencia,
            fecha_emision,
            fecha_vencimiento,
            estado,
            activo,
            created_at,
            updated_at,
            created_by,
            updated_by,
            created_by_id,
            updated_by_id
        )
        SELECT
            gen_random_uuid(),
            c.id,
            COALESCE(c.categoria_licencia, 'C'),
            COALESCE(c.numero_licencia, 'S/N'),
            COALESCE(c.created_at::date, CURRENT_DATE),
            COALESCE(c.fecha_vencimiento, CURRENT_DATE + INTERVAL '1 year'),
            'VIGENTE',
            c.activo,
            c.created_at,
            c.updated_at,
            c.created_by,
            c.updated_by,
            c.created_by_id,
            c.updated_by_id
        FROM gestion_vehicular.conductores c
        WHERE c.numero_licencia IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM gestion_vehicular.conductor_licencias cl WHERE cl.conductor_id = c.id
          );

        ALTER TABLE gestion_vehicular.conductores DROP CONSTRAINT IF EXISTS uk_conductor_numero_licencia;
        DROP INDEX IF EXISTS gestion_vehicular.idx_conductor_fecha_vencimiento;
        ALTER TABLE gestion_vehicular.conductores DROP COLUMN IF EXISTS numero_licencia;
        ALTER TABLE gestion_vehicular.conductores DROP COLUMN IF EXISTS categoria_licencia;
        ALTER TABLE gestion_vehicular.conductores DROP COLUMN IF EXISTS fecha_vencimiento;
    END IF;
END $$;

-- 3. Asegurar columnas de estado y observación en tabla conductores
ALTER TABLE gestion_vehicular.conductores 
    ADD COLUMN IF NOT EXISTS estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    ADD COLUMN IF NOT EXISTS observacion VARCHAR(1000);

CREATE INDEX IF NOT EXISTS idx_conductor_estado
    ON gestion_vehicular.conductores (estado);
