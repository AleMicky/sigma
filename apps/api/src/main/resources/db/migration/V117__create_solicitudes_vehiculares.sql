-- ============================================================================
-- Migración: V117__create_solicitudes_vehiculares.sql
-- Descripción: Crear tabla de solicitudes vehiculares.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS gestion_vehicular;

CREATE TABLE gestion_vehicular.solicitudes_vehiculares (
    id                          UUID          PRIMARY KEY,
    numero                      VARCHAR(50)   NOT NULL,
    tipo_solicitud_vehicular_id UUID          NOT NULL,
    solicitante_id              UUID          NOT NULL,
    motivo                      VARCHAR(500)  NOT NULL,
    justificacion               VARCHAR(1000),
    destino                     VARCHAR(255)  NOT NULL,
    fecha_salida                TIMESTAMPTZ   NOT NULL,
    fecha_retorno_estimada      TIMESTAMPTZ   NOT NULL,
    cantidad_pasajeros          INTEGER       NOT NULL,
    observacion                 VARCHAR(1000),
    estado                      VARCHAR(30)   NOT NULL,
    process_instance_id         VARCHAR(100),
    created_at                  TIMESTAMPTZ   NOT NULL,
    updated_at                  TIMESTAMPTZ,
    created_by                  VARCHAR(100),
    updated_by                  VARCHAR(100),
    created_by_id               UUID,
    updated_by_id               UUID,
    CONSTRAINT uk_solicitud_vehicular_numero UNIQUE (numero),
    CONSTRAINT fk_solicitud_vehicular_tipo
        FOREIGN KEY (tipo_solicitud_vehicular_id)
        REFERENCES gestion_vehicular.tipos_solicitud_vehicular (id)
);

CREATE INDEX idx_solicitud_vehicular_numero
    ON gestion_vehicular.solicitudes_vehiculares (numero);

CREATE INDEX idx_solicitud_vehicular_tipo
    ON gestion_vehicular.solicitudes_vehiculares (tipo_solicitud_vehicular_id);

CREATE INDEX idx_solicitud_vehicular_solicitante
    ON gestion_vehicular.solicitudes_vehiculares (solicitante_id);

CREATE INDEX idx_solicitud_vehicular_estado
    ON gestion_vehicular.solicitudes_vehiculares (estado);

CREATE INDEX idx_solicitud_vehicular_fechas
    ON gestion_vehicular.solicitudes_vehiculares (fecha_salida, fecha_retorno_estimada);
