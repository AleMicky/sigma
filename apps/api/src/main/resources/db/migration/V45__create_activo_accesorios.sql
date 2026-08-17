CREATE TABLE activos.activo_accesorios (
    id             UUID PRIMARY KEY,
    activo_id      UUID         NOT NULL,
    accesorio_id   UUID         NOT NULL,
    cantidad       INTEGER      NOT NULL DEFAULT 1,
    numero_serie   VARCHAR(100),
    observacion    VARCHAR(500),
    created_at     TIMESTAMPTZ  NOT NULL,
    updated_at     TIMESTAMPTZ,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    CONSTRAINT fk_activo_accesorio_activo
        FOREIGN KEY (activo_id)
        REFERENCES activos.activos (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_activo_accesorio_accesorio
        FOREIGN KEY (accesorio_id)
        REFERENCES activos.accesorios (id)
        ON DELETE RESTRICT,
    CONSTRAINT uk_activo_accesorio
        UNIQUE (activo_id, accesorio_id)
);

CREATE INDEX idx_activo_accesorio_activo
    ON activos.activo_accesorios (activo_id);

CREATE INDEX idx_activo_accesorio_accesorio
    ON activos.activo_accesorios (accesorio_id);
