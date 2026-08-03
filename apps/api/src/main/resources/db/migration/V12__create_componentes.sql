CREATE TABLE activos.componentes (
    id              UUID PRIMARY KEY,
    tipo_activo_id  UUID          NOT NULL,
    codigo          VARCHAR(50)   NOT NULL,
    nombre          VARCHAR(100)  NOT NULL,
    descripcion     VARCHAR(255),
    created_at      TIMESTAMPTZ   NOT NULL,
    updated_at      TIMESTAMPTZ,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    CONSTRAINT fk_componentes_tipo_activo
        FOREIGN KEY (tipo_activo_id)
        REFERENCES activos.tipos_activo (id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX uk_componentes_tipo_codigo_ci
    ON activos.componentes (tipo_activo_id, LOWER(codigo));

CREATE INDEX idx_componentes_tipo_activo_id
    ON activos.componentes (tipo_activo_id);
