CREATE TABLE inventarios.tipo_insumo_atributos (
    id              UUID PRIMARY KEY,
    tipo_dato_id    UUID          NOT NULL,
    tipo_insumo_id  UUID          NOT NULL,
    codigo          VARCHAR(50)   NOT NULL,
    nombre          VARCHAR(100)  NOT NULL,
    requerido       BOOLEAN       NOT NULL DEFAULT FALSE,
    orden           INTEGER       NOT NULL,
    created_at      TIMESTAMPTZ   NOT NULL,
    updated_at      TIMESTAMPTZ,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    CONSTRAINT fk_tipo_insumo_atributos_tipo_insumo
        FOREIGN KEY (tipo_insumo_id)
        REFERENCES inventarios.tipos_insumo (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_tipo_insumo_atributos_tipo_dato
        FOREIGN KEY (tipo_dato_id)
        REFERENCES parametros.tipos_dato (id)
);

CREATE UNIQUE INDEX uk_tipo_insumo_atributos_tipo_codigo_ci
    ON inventarios.tipo_insumo_atributos (tipo_insumo_id, LOWER(codigo));

CREATE UNIQUE INDEX uk_tipo_insumo_atributos_tipo_orden
    ON inventarios.tipo_insumo_atributos (tipo_insumo_id, orden);

CREATE INDEX idx_tipo_insumo_atributos_tipo_insumo_id
    ON inventarios.tipo_insumo_atributos (tipo_insumo_id);

CREATE INDEX idx_tipo_insumo_atributos_tipo_dato_id
    ON inventarios.tipo_insumo_atributos (tipo_dato_id);
