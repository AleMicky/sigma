CREATE TABLE organizacion.grupos_aprobadores_dependientes (
    id                  UUID PRIMARY KEY,
    grupo_aprobador_id  UUID          NOT NULL,
    empleado_id         UUID          NOT NULL,
    created_at          TIMESTAMPTZ   NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    CONSTRAINT fk_grupo_aprobador_dependiente_grupo
        FOREIGN KEY (grupo_aprobador_id)
        REFERENCES organizacion.grupos_aprobadores (id),
    CONSTRAINT uk_grupo_aprobador_dependiente
        UNIQUE (grupo_aprobador_id, empleado_id)
);

CREATE INDEX idx_grupo_aprobador_dependiente_empleado
    ON organizacion.grupos_aprobadores_dependientes
    (empleado_id);
