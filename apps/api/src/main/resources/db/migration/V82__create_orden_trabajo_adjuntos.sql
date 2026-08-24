CREATE TABLE mantenimientos.orden_trabajo_adjuntos (
    id              UUID          PRIMARY KEY,
    orden_trabajo_id UUID         NOT NULL,
    nombre_archivo   VARCHAR(255) NOT NULL,
    tipo_mime        VARCHAR(100) NOT NULL,
    tamanio          BIGINT,
    url              VARCHAR(1000) NOT NULL,
    descripcion      VARCHAR(500),
    created_at       TIMESTAMPTZ  NOT NULL,
    updated_at       TIMESTAMPTZ,
    created_by       VARCHAR(100),
    updated_by       VARCHAR(100)
);

CREATE INDEX idx_ot_adjunto_orden
    ON mantenimientos.orden_trabajo_adjuntos (orden_trabajo_id);
