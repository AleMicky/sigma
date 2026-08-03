CREATE TABLE activos.activo_atributo_valores (
    id                 UUID PRIMARY KEY,
    activo_id          UUID NOT NULL,
    activo_atributo_id UUID NOT NULL,
    valor              TEXT,
    created_at         TIMESTAMPTZ NOT NULL,
    updated_at         TIMESTAMPTZ,
    created_by         VARCHAR(100),
    updated_by         VARCHAR(100),
    CONSTRAINT fk_activo_atributo_valores_activo
        FOREIGN KEY (activo_id)
        REFERENCES activos.activos (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_activo_atributo_valores_atributo
        FOREIGN KEY (activo_atributo_id)
        REFERENCES activos.activo_atributos (id)
        ON DELETE CASCADE,
    CONSTRAINT uk_activo_atributo_valores_activo_atributo
        UNIQUE (activo_id, activo_atributo_id)
);

CREATE INDEX idx_activo_atributo_valores_activo_id
    ON activos.activo_atributo_valores (activo_id);

CREATE INDEX idx_activo_atributo_valores_atributo_id
    ON activos.activo_atributo_valores (activo_atributo_id);
