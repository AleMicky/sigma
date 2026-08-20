CREATE TABLE IF NOT EXISTS parametros.correlativos (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo        VARCHAR(100) NOT NULL,
    gestion       INTEGER      NOT NULL,
    ultimo_numero INTEGER      NOT NULL DEFAULT 0,
    prefijo       VARCHAR(20),
    longitud      INTEGER      NOT NULL DEFAULT 4,
    CONSTRAINT uk_correlativo_codigo_gestion UNIQUE (codigo, gestion)
);

CREATE INDEX IF NOT EXISTS idx_correlativo_codigo
    ON parametros.correlativos (codigo);

CREATE INDEX IF NOT EXISTS idx_correlativo_gestion
    ON parametros.correlativos (gestion);
