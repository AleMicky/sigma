CREATE TABLE activos.activo_atributos (
    id              UUID PRIMARY KEY,
    tipo_activo_id  UUID          NOT NULL,
    codigo          VARCHAR(50)   NOT NULL,
    etiqueta        VARCHAR(100)  NOT NULL,
    descripcion     VARCHAR(255),
    tipo_dato_id    UUID          NOT NULL,
    orden           INTEGER       NOT NULL DEFAULT 0,
    requerido       BOOLEAN       NOT NULL DEFAULT FALSE,
    visible         BOOLEAN       NOT NULL DEFAULT TRUE,
    editable        BOOLEAN       NOT NULL DEFAULT TRUE,
    valor_defecto   VARCHAR(255),
    opciones        JSONB,
    created_at      TIMESTAMPTZ   NOT NULL,
    updated_at      TIMESTAMPTZ,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    CONSTRAINT fk_activo_atributos_tipo_activo
        FOREIGN KEY (tipo_activo_id)
        REFERENCES activos.tipos_activo (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_activo_atributos_tipo_dato
        FOREIGN KEY (tipo_dato_id)
        REFERENCES parametros.tipos_dato (id)
);

CREATE UNIQUE INDEX uk_activo_atributos_tipo_codigo_ci
    ON activos.activo_atributos (tipo_activo_id, LOWER(codigo));

CREATE UNIQUE INDEX uk_activo_atributos_tipo_orden
    ON activos.activo_atributos (tipo_activo_id, orden);

CREATE INDEX idx_activo_atributos_tipo_activo_id
    ON activos.activo_atributos (tipo_activo_id);

CREATE INDEX idx_activo_atributos_tipo_dato_id
    ON activos.activo_atributos (tipo_dato_id);
