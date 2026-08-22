CREATE TABLE organizacion.grupos_aprobadores_detalles (
    id                  UUID PRIMARY KEY,
    grupo_aprobador_id  UUID          NOT NULL,
    tipo_aprobador      VARCHAR(30)   NOT NULL,
    empleado_id         UUID,
    cargo_id            UUID,
    unidad_id           UUID,
    responsabilidad_id  UUID,
    alcance             VARCHAR(40)   NOT NULL,
    orden               INTEGER       NOT NULL,
    requiere_aprobacion BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ   NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    CONSTRAINT fk_grupo_aprobador_detalle_grupo
        FOREIGN KEY (grupo_aprobador_id)
        REFERENCES organizacion.grupos_aprobadores (id)
);

CREATE INDEX idx_grupo_aprobador_detalle_grupo
    ON organizacion.grupos_aprobadores_detalles
    (grupo_aprobador_id);
