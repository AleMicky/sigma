CREATE TABLE activos.activo_documento (
    id                  UUID PRIMARY KEY,
    activo_id           UUID         NOT NULL,
    tipo_documento_id   UUID         NOT NULL,
    numero_documento    VARCHAR(100),
    nombre              VARCHAR(150) NOT NULL,
    descripcion         VARCHAR(500),
    fecha_emision       DATE,
    fecha_vencimiento   DATE,
    nombre_archivo      VARCHAR(255) NOT NULL,
    ruta_archivo        VARCHAR(500) NOT NULL,
    mime_type           VARCHAR(100),
    size                BIGINT,
    created_at          TIMESTAMPTZ  NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100)
);

CREATE INDEX idx_activo_documento_activo
    ON activos.activo_documento (activo_id);

CREATE INDEX idx_activo_documento_tipo
    ON activos.activo_documento (tipo_documento_id);

CREATE INDEX idx_activo_documento_vencimiento
    ON activos.activo_documento (fecha_vencimiento);
