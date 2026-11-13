-- ============================================================================
-- Migración: V166__create_registros_porteria.sql
-- Descripción: Crear tablas para registro de salida y llegada en portería
--              (guardia, empleado, hora de salida/llegada y activos asociados).
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS gestion_vehicular;

CREATE TABLE IF NOT EXISTS gestion_vehicular.registros_porteria (
    id                  UUID         PRIMARY KEY,
    numero              VARCHAR(30)  NOT NULL,
    empleado_id         UUID         NOT NULL,
    guardia_salida_id   UUID,
    guardia_llegada_id  UUID,
    salida_vehicular_id UUID,
    fecha_hora_salida   TIMESTAMPTZ  NOT NULL,
    fecha_hora_llegada  TIMESTAMPTZ,
    estado              VARCHAR(30)  NOT NULL,
    observacion_salida  TEXT,
    observacion_llegada TEXT,
    created_at          TIMESTAMPTZ  NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    created_by_id       UUID,
    updated_by_id       UUID,
    CONSTRAINT uk_registro_porteria_numero UNIQUE (numero),
    CONSTRAINT fk_registro_porteria_salida_vehicular FOREIGN KEY (salida_vehicular_id)
        REFERENCES gestion_vehicular.salidas_vehiculares (id)
);

CREATE INDEX IF NOT EXISTS idx_registro_porteria_empleado
    ON gestion_vehicular.registros_porteria (empleado_id);

CREATE INDEX IF NOT EXISTS idx_registro_porteria_estado
    ON gestion_vehicular.registros_porteria (estado);

CREATE INDEX IF NOT EXISTS idx_registro_porteria_fecha_salida
    ON gestion_vehicular.registros_porteria (fecha_hora_salida);

CREATE INDEX IF NOT EXISTS idx_registro_porteria_salida_vehicular
    ON gestion_vehicular.registros_porteria (salida_vehicular_id);

CREATE TABLE IF NOT EXISTS gestion_vehicular.registros_porteria_activos (
    id                   UUID         PRIMARY KEY,
    registro_porteria_id UUID         NOT NULL,
    activo_id            UUID,
    descripcion_item     VARCHAR(300),
    cantidad             INTEGER      NOT NULL DEFAULT 1,
    observacion_salida   VARCHAR(500),
    retornado            BOOLEAN,
    observacion_llegada  VARCHAR(500),
    created_at           TIMESTAMPTZ  NOT NULL,
    updated_at           TIMESTAMPTZ,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100),
    created_by_id        UUID,
    updated_by_id        UUID,
    CONSTRAINT fk_registro_porteria_activo_cabecera FOREIGN KEY (registro_porteria_id)
        REFERENCES gestion_vehicular.registros_porteria (id) ON DELETE CASCADE,
    CONSTRAINT fk_registro_porteria_activo_ref FOREIGN KEY (activo_id)
        REFERENCES activos.activos (id)
);

CREATE INDEX IF NOT EXISTS idx_registro_porteria_activos_cabecera
    ON gestion_vehicular.registros_porteria_activos (registro_porteria_id);

CREATE INDEX IF NOT EXISTS idx_registro_porteria_activos_activo
    ON gestion_vehicular.registros_porteria_activos (activo_id);

INSERT INTO parametros.correlativos (
    id,
    codigo,
    gestion,
    ultimo_numero,
    prefijo,
    longitud
) VALUES (
    gen_random_uuid(),
    'REGISTRO_PORTERIA',
    2026,
    0,
    'PRT',
    4
) ON CONFLICT (codigo, gestion) DO NOTHING;

