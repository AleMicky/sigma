CREATE TABLE mantenimientos.solicitudes_mantenimiento (
    id                          UUID PRIMARY KEY,
    numero                      VARCHAR(30)   NOT NULL,
    activo_id                   UUID          NOT NULL,
    tipo_mantenimiento_id       UUID          NOT NULL,
    motivo_mantenimiento        VARCHAR(50)   NOT NULL,
    prioridad_id                UUID          NOT NULL,
    solicitante_id              UUID          NOT NULL,
    area_solicitante_id         UUID,
    titulo                      VARCHAR(150)  NOT NULL,
    descripcion                 VARCHAR(2000) NOT NULL,
    fecha_solicitud             TIMESTAMPTZ   NOT NULL,
    aprobado_por_id             UUID,
    fecha_aprobacion            TIMESTAMPTZ,
    observacion_aprobacion      VARCHAR(1000),
    responsable_id              UUID,
    fecha_asignacion            TIMESTAMPTZ,
    fecha_inicio_mantenimiento  TIMESTAMPTZ,
    fecha_fin_mantenimiento     TIMESTAMPTZ,
    supervisor_id               UUID,
    fecha_validacion            TIMESTAMPTZ,
    observacion_validacion      VARCHAR(1000),
    fecha_finalizacion          TIMESTAMPTZ,
    recibido_por_id             UUID,
    observacion_cierre          VARCHAR(1000),
    estado                      VARCHAR(50)   NOT NULL,
    process_instance_id         VARCHAR(100),
    created_at                  TIMESTAMPTZ   NOT NULL,
    updated_at                  TIMESTAMPTZ,
    created_by                  VARCHAR(100),
    updated_by                  VARCHAR(100),
    CONSTRAINT uk_solicitud_mantenimiento_numero UNIQUE (numero),
    CONSTRAINT fk_solicitud_mantenimiento_activo FOREIGN KEY (activo_id) REFERENCES activos.activos (id),
    CONSTRAINT fk_solicitud_mantenimiento_tipo FOREIGN KEY (tipo_mantenimiento_id) REFERENCES mantenimientos.tipos_mantenimiento (id),
    CONSTRAINT fk_solicitud_mantenimiento_prioridad FOREIGN KEY (prioridad_id) REFERENCES mantenimientos.prioridades (id)
);

CREATE INDEX idx_solicitud_mantenimiento_activo
    ON mantenimientos.solicitudes_mantenimiento (activo_id);

CREATE INDEX idx_solicitud_mantenimiento_estado
    ON mantenimientos.solicitudes_mantenimiento (estado);

CREATE INDEX idx_solicitud_mantenimiento_solicitante
    ON mantenimientos.solicitudes_mantenimiento (solicitante_id);

CREATE INDEX idx_solicitud_mantenimiento_responsable
    ON mantenimientos.solicitudes_mantenimiento (responsable_id);

CREATE INDEX idx_solicitud_mantenimiento_fecha
    ON mantenimientos.solicitudes_mantenimiento (fecha_solicitud);
