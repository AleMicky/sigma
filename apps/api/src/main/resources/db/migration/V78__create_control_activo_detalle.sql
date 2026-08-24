CREATE TABLE mantenimientos.control_activo_detalle (
    id                   UUID          PRIMARY KEY,
    control_activo_id    UUID          NOT NULL,
    accesorio_id         UUID          NOT NULL,
    cantidad_esperada    INTEGER       NOT NULL,
    cantidad_encontrada  INTEGER       NOT NULL,
    conforme             BOOLEAN       NOT NULL,
    observacion          VARCHAR(300),
    created_at           TIMESTAMPTZ   NOT NULL,
    updated_at           TIMESTAMPTZ,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100),
    CONSTRAINT uk_control_activo_accesorio UNIQUE (control_activo_id, accesorio_id)
);

CREATE INDEX idx_control_activo_detalle_control
    ON mantenimientos.control_activo_detalle (control_activo_id);

CREATE INDEX idx_control_activo_detalle_accesorio
    ON mantenimientos.control_activo_detalle (accesorio_id);
