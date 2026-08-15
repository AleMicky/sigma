CREATE TABLE inventarios.insumos (
    id                  UUID PRIMARY KEY,
    codigo              VARCHAR(30)   NOT NULL,
    nombre              VARCHAR(150)  NOT NULL,
    descripcion         VARCHAR(500),
    tipo_insumo_id      UUID          NOT NULL,
    categoria_insumo_id UUID          NOT NULL,
    unidad_medida_id    UUID          NOT NULL,
    marca               VARCHAR(100),
    created_at          TIMESTAMPTZ   NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    CONSTRAINT fk_insumos_tipo_insumo
        FOREIGN KEY (tipo_insumo_id)
        REFERENCES inventarios.tipos_insumo (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_insumos_categoria_insumo
        FOREIGN KEY (categoria_insumo_id)
        REFERENCES inventarios.categorias_insumo (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_insumos_unidad_medida
        FOREIGN KEY (unidad_medida_id)
        REFERENCES parametros.unidades_medida (id)
        ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uk_insumos_codigo_ci
    ON inventarios.insumos (LOWER(codigo));

CREATE INDEX idx_insumos_tipo_insumo_id
    ON inventarios.insumos (tipo_insumo_id);

CREATE INDEX idx_insumos_categoria_insumo_id
    ON inventarios.insumos (categoria_insumo_id);

CREATE INDEX idx_insumos_unidad_medida_id
    ON inventarios.insumos (unidad_medida_id);
