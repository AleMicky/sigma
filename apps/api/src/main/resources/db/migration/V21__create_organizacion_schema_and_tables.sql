CREATE SCHEMA IF NOT EXISTS organizacion;

CREATE TABLE organizacion.personas (
    id                  UUID PRIMARY KEY,
    tipo_documento      VARCHAR(20)  NOT NULL,
    numero_documento    VARCHAR(50)  NOT NULL,
    complemento         VARCHAR(10),
    nombres             VARCHAR(100) NOT NULL,
    primer_apellido     VARCHAR(100) NOT NULL,
    segundo_apellido    VARCHAR(100),
    fecha_nacimiento    DATE,
    telefono            VARCHAR(30),
    correo              VARCHAR(150),
    sistema_origen      VARCHAR(50),
    codigo_externo      VARCHAR(100),
    activo              BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ  NOT NULL,
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100)
);

CREATE UNIQUE INDEX uk_personas_documento_ci
    ON organizacion.personas
       (LOWER(tipo_documento), LOWER(numero_documento), COALESCE(LOWER(complemento), ''));

CREATE TABLE organizacion.areas (
    id              UUID PRIMARY KEY,
    codigo          VARCHAR(50)  NOT NULL,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     VARCHAR(255),
    sistema_origen  VARCHAR(50),
    codigo_externo  VARCHAR(100),
    created_at      TIMESTAMPTZ  NOT NULL,
    updated_at      TIMESTAMPTZ,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100)
);

CREATE UNIQUE INDEX uk_areas_codigo_ci
    ON organizacion.areas (LOWER(codigo));

CREATE TABLE organizacion.cargos (
    id              UUID PRIMARY KEY,
    codigo          VARCHAR(50)  NOT NULL,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     VARCHAR(255),
    sistema_origen  VARCHAR(50),
    codigo_externo  VARCHAR(100),
    created_at      TIMESTAMPTZ  NOT NULL,
    updated_at      TIMESTAMPTZ,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100)
);

CREATE UNIQUE INDEX uk_cargos_codigo_ci
    ON organizacion.cargos (LOWER(codigo));

CREATE TABLE organizacion.empleados (
    id              UUID PRIMARY KEY,
    persona_id      UUID         NOT NULL,
    area_id         UUID         NOT NULL,
    cargo_id        UUID         NOT NULL,
    codigo          VARCHAR(50)  NOT NULL,
    fecha_inicio    DATE,
    fecha_fin       DATE,
    sistema_origen  VARCHAR(50),
    codigo_externo  VARCHAR(100),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL,
    updated_at      TIMESTAMPTZ,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    CONSTRAINT fk_empleados_persona
        FOREIGN KEY (persona_id)
        REFERENCES organizacion.personas (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_empleados_area
        FOREIGN KEY (area_id)
        REFERENCES organizacion.areas (id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_empleados_cargo
        FOREIGN KEY (cargo_id)
        REFERENCES organizacion.cargos (id)
        ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uk_empleados_codigo_ci
    ON organizacion.empleados (LOWER(codigo));

CREATE INDEX idx_empleados_persona_id
    ON organizacion.empleados (persona_id);

CREATE INDEX idx_empleados_area_id
    ON organizacion.empleados (area_id);

CREATE INDEX idx_empleados_cargo_id
    ON organizacion.empleados (cargo_id);