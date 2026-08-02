CREATE TABLE parametros.catalogo_items (
    id           UUID PRIMARY KEY,
    catalogo_id  UUID          NOT NULL,
    nombre       VARCHAR(100)  NOT NULL,
    valor        VARCHAR(50)   NOT NULL,
    orden        INTEGER       NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ   NOT NULL,
    updated_at   TIMESTAMPTZ,
    created_by   VARCHAR(100),
    updated_by   VARCHAR(100),
    CONSTRAINT fk_catalogo_items_catalogo
        FOREIGN KEY (catalogo_id)
        REFERENCES parametros.catalogos (id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX uk_catalogo_items_catalogo_valor_ci
    ON parametros.catalogo_items (catalogo_id, LOWER(valor));

CREATE INDEX idx_catalogo_items_catalogo_id
    ON parametros.catalogo_items (catalogo_id);
