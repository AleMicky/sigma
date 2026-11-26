-- ============================================================================
-- Migración: V157__create_salidas_vehiculares_eventos_and_bitacoras.sql
-- Descripción: Crear tablas para salidas vehiculares, eventos dinámicos y bitácoras,
--              así como el registro del workflow y correlativo correspondiente.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS gestion_vehicular;

-- 1. Tabla de Salidas Vehiculares
CREATE TABLE IF NOT EXISTS gestion_vehicular.salidas_vehiculares (
    id                  UUID         PRIMARY KEY,
    numero              VARCHAR(30)  NOT NULL,
    activo_id           UUID         NOT NULL,
    empleado_id         UUID         NOT NULL,
    motivo              TEXT         NOT NULL,
    origen              VARCHAR(255) NOT NULL,
    destino             VARCHAR(255) NOT NULL,
    estado              VARCHAR(50)  NOT NULL,
    process_instance_id VARCHAR(100),
    created_at          TIMESTAMPTZ  NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    created_by_id       UUID,
    updated_by_id       UUID,
    CONSTRAINT uk_salida_numero UNIQUE (numero),
    CONSTRAINT uk_salida_process_instance UNIQUE (process_instance_id),
    CONSTRAINT fk_salida_activo FOREIGN KEY (activo_id) REFERENCES activos.activos (id)
);

CREATE INDEX IF NOT EXISTS idx_salida_activo
    ON gestion_vehicular.salidas_vehiculares (activo_id);

CREATE INDEX IF NOT EXISTS idx_salida_empleado
    ON gestion_vehicular.salidas_vehiculares (empleado_id);

CREATE INDEX IF NOT EXISTS idx_salida_estado
    ON gestion_vehicular.salidas_vehiculares (estado);

-- 2. Tabla de Eventos de Salida Vehicular
CREATE TABLE IF NOT EXISTS gestion_vehicular.salidas_vehiculares_eventos (
    id                  UUID           PRIMARY KEY,
    salida_vehicular_id UUID           NOT NULL,
    empleado_id         UUID           NOT NULL,
    tipo_evento         VARCHAR(80)    NOT NULL,
    fecha_hora          TIMESTAMPTZ    NOT NULL,
    kilometraje         NUMERIC(12, 2),
    latitud             NUMERIC(10, 7),
    longitud            NUMERIC(10, 7),
    observacion         TEXT,
    created_at          TIMESTAMPTZ    NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    created_by_id       UUID,
    updated_by_id       UUID,
    CONSTRAINT fk_evento_salida FOREIGN KEY (salida_vehicular_id)
        REFERENCES gestion_vehicular.salidas_vehiculares (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evento_salida_fecha
    ON gestion_vehicular.salidas_vehiculares_eventos (salida_vehicular_id, fecha_hora);

CREATE INDEX IF NOT EXISTS idx_evento_tipo
    ON gestion_vehicular.salidas_vehiculares_eventos (tipo_evento);

-- 3. Tabla de Bitácoras Vehiculares
CREATE TABLE IF NOT EXISTS gestion_vehicular.bitacoras_vehiculares (
    id                  UUID           PRIMARY KEY,
    salida_vehicular_id UUID           NOT NULL,
    empleado_id         UUID           NOT NULL,
    tipo                VARCHAR(80)    NOT NULL,
    fecha_hora          TIMESTAMPTZ    NOT NULL,
    descripcion         TEXT           NOT NULL,
    latitud             NUMERIC(10, 7),
    longitud            NUMERIC(10, 7),
    created_at          TIMESTAMPTZ    NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    created_by_id       UUID,
    updated_by_id       UUID,
    CONSTRAINT fk_bitacora_salida FOREIGN KEY (salida_vehicular_id)
        REFERENCES gestion_vehicular.salidas_vehiculares (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bitacora_salida_fecha
    ON gestion_vehicular.bitacoras_vehiculares (salida_vehicular_id, fecha_hora);

CREATE INDEX IF NOT EXISTS idx_bitacora_tipo
    ON gestion_vehicular.bitacoras_vehiculares (tipo);

CREATE INDEX IF NOT EXISTS idx_bitacora_empleado
    ON gestion_vehicular.bitacoras_vehiculares (empleado_id);

-- 4. Registrar Workflow para Salidas Vehiculares
INSERT INTO workflow.workflows (
    id,
    codigo,
    nombre,
    descripcion,
    modulo,
    process_definition_key,
    activo
) VALUES (
    gen_random_uuid(),
    'SALIDA_VEHICULAR',
    'Gestión de Salidas Vehiculares',
    'Workflow dinámico para el ciclo de vida de salidas vehiculares en ruta',
    'GESTION_VEHICULAR',
    'procesoSalidaVehicular',
    TRUE
) ON CONFLICT (codigo) DO NOTHING;

-- 5. Registrar Correlativo para Salidas Vehiculares
INSERT INTO parametros.correlativos (
    id,
    codigo,
    gestion,
    ultimo_numero,
    prefijo,
    longitud
) VALUES (
    gen_random_uuid(),
    'SALIDA_VEHICULAR',
    2026,
    0,
    'SAL',
    4
) ON CONFLICT (codigo, gestion) DO NOTHING;
