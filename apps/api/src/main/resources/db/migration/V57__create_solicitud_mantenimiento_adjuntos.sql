CREATE TABLE IF NOT EXISTS mantenimientos.solicitud_mantenimiento_adjuntos
(
    id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitud_mantenimiento_id    UUID         NOT NULL,
    nombre_archivo                VARCHAR(255) NOT NULL,
    tipo_contenido                VARCHAR(100) NOT NULL,
    size                          BIGINT       NOT NULL,
    url                           VARCHAR(1000) NOT NULL,
    descripcion                   VARCHAR(500),
    created_at                    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at                    TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_by                    VARCHAR(100),
    updated_by                    VARCHAR(100),

    CONSTRAINT fk_adjunto_solicitud_mantenimiento
        FOREIGN KEY (solicitud_mantenimiento_id)
        REFERENCES mantenimientos.solicitudes_mantenimiento (id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_solicitud_adjunto_solicitud
    ON mantenimientos.solicitud_mantenimiento_adjuntos (solicitud_mantenimiento_id);
