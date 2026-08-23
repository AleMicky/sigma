CREATE SCHEMA IF NOT EXISTS workflow;

CREATE TABLE workflow.workflows
(
    id                     UUID         NOT NULL,
    codigo                 VARCHAR(80)  NOT NULL,
    nombre                 VARCHAR(150) NOT NULL,
    descripcion            VARCHAR(500),
    modulo                 VARCHAR(80)  NOT NULL,
    process_definition_key VARCHAR(150) NOT NULL,

    activo                 BOOLEAN      NOT NULL DEFAULT TRUE,

    created_at             TIMESTAMP,
    updated_at             TIMESTAMP,
    created_by             VARCHAR(255),
    updated_by             VARCHAR(255),

    CONSTRAINT pk_workflows
        PRIMARY KEY (id),

    CONSTRAINT uk_workflow_codigo
        UNIQUE (codigo)
);

CREATE INDEX idx_workflow_modulo
    ON workflow.workflows (modulo);

CREATE INDEX idx_workflow_process_definition_key
    ON workflow.workflows (process_definition_key);


INSERT INTO workflow.workflows
(
    id,
    codigo,
    nombre,
    descripcion,
    modulo,
    process_definition_key,
    activo
)
VALUES
    (
        gen_random_uuid(),
        'SOLICITUD_MANTENIMIENTO',
        'Solicitud de Mantenimiento',
        'Workflow para gestionar solicitudes de mantenimiento',
        'MANTENIMIENTOS',
        'solicitudMantenimientoProcess',
        TRUE
    );