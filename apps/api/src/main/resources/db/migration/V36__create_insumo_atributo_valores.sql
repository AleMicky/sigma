CREATE TABLE inventarios.insumo_atributo_valores (
    id                      UUID PRIMARY KEY,
    insumo_id               UUID          NOT NULL,
    tipo_insumo_atributo_id UUID          NOT NULL,
    valor                   VARCHAR(500)  NOT NULL,
    created_at              TIMESTAMPTZ   NOT NULL,
    updated_at              TIMESTAMPTZ,
    created_by              VARCHAR(100),
    updated_by              VARCHAR(100),
    CONSTRAINT uk_insumo_atributo_valores_insumo_atributo
        UNIQUE (insumo_id, tipo_insumo_atributo_id),
    CONSTRAINT fk_insumo_atributo_valores_insumo
        FOREIGN KEY (insumo_id)
        REFERENCES inventarios.insumos (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_insumo_atributo_valores_atributo
        FOREIGN KEY (tipo_insumo_atributo_id)
        REFERENCES inventarios.tipo_insumo_atributos (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_insumo_atributo_valores_insumo_id
    ON inventarios.insumo_atributo_valores (insumo_id);

CREATE INDEX idx_insumo_atributo_valores_atributo_id
    ON inventarios.insumo_atributo_valores (tipo_insumo_atributo_id);
