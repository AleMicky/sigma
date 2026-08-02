CREATE TABLE parametros.gestiones (
    id           UUID PRIMARY KEY,
    gestion      INTEGER      NOT NULL,
    fecha_inicio DATE         NOT NULL,
    fecha_fin    DATE         NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL,
    updated_at   TIMESTAMPTZ,
    created_by   VARCHAR(100),
    updated_by   VARCHAR(100),
    CONSTRAINT ck_gestiones_rango_fechas
        CHECK (fecha_inicio <= fecha_fin)
);

CREATE UNIQUE INDEX uk_gestiones_gestion
    ON parametros.gestiones (gestion);

CREATE TABLE parametros.periodos (
    id           UUID PRIMARY KEY,
    gestion_id   UUID         NOT NULL,
    periodo      INTEGER      NOT NULL,
    literal      VARCHAR(50)  NOT NULL,
    fecha_inicio DATE         NOT NULL,
    fecha_fin    DATE         NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL,
    updated_at   TIMESTAMPTZ,
    created_by   VARCHAR(100),
    updated_by   VARCHAR(100),
    CONSTRAINT fk_periodos_gestion
        FOREIGN KEY (gestion_id)
        REFERENCES parametros.gestiones (id)
        ON DELETE CASCADE,
    CONSTRAINT ck_periodos_rango_fechas
        CHECK (fecha_inicio <= fecha_fin),
    CONSTRAINT ck_periodos_periodo
        CHECK (periodo BETWEEN 1 AND 12)
);

CREATE UNIQUE INDEX uk_periodos_gestion_periodo
    ON parametros.periodos (gestion_id, periodo);

CREATE INDEX idx_periodos_gestion_id
    ON parametros.periodos (gestion_id);
