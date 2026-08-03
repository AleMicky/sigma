CREATE TABLE activos.documentos (
    id                  UUID PRIMARY KEY,
    activo_id           UUID         NOT NULL,
    tipo_documento_id   UUID         NOT NULL,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         VARCHAR(255),
    nombre_original     VARCHAR(255),
    nombre_archivo      VARCHAR(255),
    ruta                VARCHAR(500),
    extension           VARCHAR(20),
    mime_type           VARCHAR(100),
    tamano_bytes        BIGINT,
    fecha_documento     DATE,
    fecha_vencimiento   DATE,
    created_at          TIMESTAMPTZ  NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100)
);

CREATE INDEX idx_documentos_activo
    ON activos.documentos (activo_id);

CREATE INDEX idx_documentos_tipo_documento
    ON activos.documentos (tipo_documento_id);