-- ============================================================================
-- Migración: V187__create_cuestionarios_module.sql
-- Descripción: REQ-BIZ-012. Crea el schema cuestionarios y sus 5 tablas para
--              el motor parametrizable de cuestionarios e integración desacoplada
--              con otros módulos (p. ej. Solicitudes de Vehículos al finalizar).
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS cuestionarios;

-- ── 1. Plantillas de cuestionarios ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cuestionarios.cuestionarios (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo              VARCHAR(50)  NOT NULL UNIQUE,
    nombre              VARCHAR(150) NOT NULL,
    descripcion         TEXT,
    modulo_origen       VARCHAR(50)  NOT NULL,
    entidad_tipo        VARCHAR(60)  NOT NULL,
    evento_disparador   VARCHAR(60)  NOT NULL,
    version             INTEGER      NOT NULL DEFAULT 1 CHECK (version >= 1),
    estado              VARCHAR(20)  NOT NULL DEFAULT 'BORRADOR'
                            CHECK (estado IN ('BORRADOR', 'PUBLICADO', 'INACTIVO')),
    obligatorio         BOOLEAN      NOT NULL DEFAULT FALSE,
    anonimo_en_reportes BOOLEAN      NOT NULL DEFAULT FALSE,
    activo              BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    created_by_id       UUID,
    updated_by_id       UUID
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_cuestionario_publicado_disparador
    ON cuestionarios.cuestionarios (modulo_origen, entidad_tipo, evento_disparador)
    WHERE estado = 'PUBLICADO' AND activo = TRUE;

CREATE INDEX IF NOT EXISTS idx_cuestionarios_modulo_estado
    ON cuestionarios.cuestionarios (modulo_origen, estado, activo);

-- ── 2. Preguntas parametrizables ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cuestionarios.preguntas (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cuestionario_id   UUID          NOT NULL REFERENCES cuestionarios.cuestionarios(id) ON DELETE CASCADE,
    seccion           VARCHAR(100),
    orden             INTEGER       NOT NULL CHECK (orden > 0),
    enunciado         VARCHAR(500)  NOT NULL,
    descripcion_ayuda VARCHAR(500),
    tipo_pregunta     VARCHAR(30)   NOT NULL
                          CHECK (tipo_pregunta IN (
                              'ESTRELLAS_1_5',
                              'ESCALA_1_5',
                              'SI_NO',
                              'OPCION_UNICA',
                              'OPCION_MULTIPLE',
                              'TEXTO_CORTO',
                              'TEXTO_LARGO',
                              'NUMERICO'
                          )),
    obligatoria       BOOLEAN       NOT NULL DEFAULT TRUE,
    peso              NUMERIC(8,2)  NOT NULL DEFAULT 1.00 CHECK (peso >= 0),
    config_json       JSONB,
    activo            BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ,
    created_by        VARCHAR(100),
    updated_by        VARCHAR(100),
    created_by_id     UUID,
    updated_by_id     UUID
);

CREATE INDEX IF NOT EXISTS idx_cuestionario_preguntas_cuestionario
    ON cuestionarios.preguntas (cuestionario_id, orden);

-- ── 3. Opciones de preguntas cerradas ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cuestionarios.pregunta_opciones (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pregunta_id   UUID          NOT NULL REFERENCES cuestionarios.preguntas(id) ON DELETE CASCADE,
    orden         INTEGER       NOT NULL CHECK (orden > 0),
    etiqueta      VARCHAR(200)  NOT NULL,
    valor         VARCHAR(100)  NOT NULL,
    puntaje       NUMERIC(8,2)  NOT NULL DEFAULT 0.00,
    activo        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ,
    created_by    VARCHAR(100),
    updated_by    VARCHAR(100),
    created_by_id UUID,
    updated_by_id UUID
);

CREATE INDEX IF NOT EXISTS idx_cuestionario_opciones_pregunta
    ON cuestionarios.pregunta_opciones (pregunta_id, orden);

-- ── 4. Asignaciones / instancias de evaluación por entidad ───────────────────
CREATE TABLE IF NOT EXISTS cuestionarios.asignaciones (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cuestionario_id          UUID          NOT NULL REFERENCES cuestionarios.cuestionarios(id),
    cuestionario_version     INTEGER       NOT NULL CHECK (cuestionario_version >= 1),
    modulo_origen            VARCHAR(50)   NOT NULL,
    entidad_tipo             VARCHAR(60)   NOT NULL,
    entidad_id               UUID          NOT NULL,
    entidad_codigo_ref       VARCHAR(80),
    evaluado_tipo            VARCHAR(50),
    evaluado_id              UUID,
    evaluado_nombre_snapshot VARCHAR(200),
    evaluador_empleado_id    UUID          NOT NULL,
    obligatorio              BOOLEAN       NOT NULL DEFAULT FALSE,
    anonimo_en_reportes      BOOLEAN       NOT NULL DEFAULT FALSE,
    estado                   VARCHAR(20)   NOT NULL DEFAULT 'PENDIENTE'
                                 CHECK (estado IN ('PENDIENTE', 'RESPONDIDO', 'OMITIDO')),
    fecha_habilitacion       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    fecha_respuesta          TIMESTAMPTZ,
    puntaje_total            NUMERIC(10,2),
    puntaje_maximo           NUMERIC(10,2),
    porcentaje               NUMERIC(5,2),
    comentario_general       TEXT,
    created_at               TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ,
    created_by               VARCHAR(100),
    updated_by               VARCHAR(100),
    created_by_id            UUID,
    updated_by_id            UUID
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_cuestionario_asignacion_unica
    ON cuestionarios.asignaciones (cuestionario_id, entidad_tipo, entidad_id, evaluador_empleado_id);

CREATE INDEX IF NOT EXISTS idx_cuestionario_asignaciones_evaluador_estado
    ON cuestionarios.asignaciones (evaluador_empleado_id, estado, fecha_habilitacion DESC);

CREATE INDEX IF NOT EXISTS idx_cuestionario_asignaciones_entidad
    ON cuestionarios.asignaciones (entidad_tipo, entidad_id);

CREATE INDEX IF NOT EXISTS idx_cuestionario_asignaciones_evaluado
    ON cuestionarios.asignaciones (evaluado_tipo, evaluado_id, estado);

CREATE INDEX IF NOT EXISTS idx_cuestionario_asignaciones_cuestionario_estado
    ON cuestionarios.asignaciones (cuestionario_id, estado, fecha_respuesta DESC);

-- ── 5. Respuestas detalladas con snapshot de pregunta ────────────────────────
CREATE TABLE IF NOT EXISTS cuestionarios.respuestas_detalle (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asignacion_id               UUID          NOT NULL REFERENCES cuestionarios.asignaciones(id) ON DELETE CASCADE,
    pregunta_id                 UUID          NOT NULL REFERENCES cuestionarios.preguntas(id),
    pregunta_enunciado_snapshot VARCHAR(500)  NOT NULL,
    tipo_pregunta_snapshot      VARCHAR(30)   NOT NULL,
    valor_texto                 TEXT,
    valor_numerico              NUMERIC(12,2),
    valor_booleano              BOOLEAN,
    opcion_id                   UUID,
    opciones_ids                JSONB,
    puntaje_obtenido            NUMERIC(10,2),
    created_at                  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ,
    created_by                  VARCHAR(100),
    updated_by                  VARCHAR(100),
    created_by_id               UUID,
    updated_by_id               UUID
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_respuesta_asignacion_pregunta
    ON cuestionarios.respuestas_detalle (asignacion_id, pregunta_id);

CREATE INDEX IF NOT EXISTS idx_respuestas_detalle_pregunta
    ON cuestionarios.respuestas_detalle (pregunta_id);

-- ── 6. Plantilla base en BORRADOR para Evaluación de Conductor ───────────────
INSERT INTO cuestionarios.cuestionarios (
    id, codigo, nombre, descripcion,
    modulo_origen, entidad_tipo, evento_disparador,
    version, estado, obligatorio, anonimo_en_reportes, activo,
    created_at, updated_at, created_by, updated_by
)
VALUES (
    'c1000000-0000-4000-a000-000000000001',
    'EVAL_CONDUCTOR_VIAJE',
    'Evaluación del Servicio de Conductor',
    'Encuesta parametrizable disparada al finalizar una Solicitud de Vehículo para evaluar puntualidad, conducción segura y trato del conductor.',
    'GESTION_VEHICULAR',
    'SOLICITUD_VEHICULAR',
    'AL_FINALIZAR',
    1,
    'BORRADOR',
    FALSE,
    FALSE,
    TRUE,
    NOW(),
    NOW(),
    'flyway-v187',
    'flyway-v187'
)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO cuestionarios.preguntas (
    id, cuestionario_id, seccion, orden, enunciado, descripcion_ayuda,
    tipo_pregunta, obligatoria, peso, config_json, activo,
    created_at, updated_at, created_by, updated_by
)
VALUES
    (
        'c2000000-0000-4000-a000-000000000001',
        'c1000000-0000-4000-a000-000000000001',
        'Desempeño del Conductor',
        1,
        '¿Cómo califica la puntualidad y cumplimiento del itinerario?',
        '1 = Muy deficiente, 5 = Excelente',
        'ESTRELLAS_1_5',
        TRUE,
        1.00,
        '{"min": 1, "max": 5, "etiquetaMin": "Muy deficiente", "etiquetaMax": "Excelente"}'::jsonb,
        TRUE,
        NOW(), NOW(), 'flyway-v187', 'flyway-v187'
    ),
    (
        'c2000000-0000-4000-a000-000000000002',
        'c1000000-0000-4000-a000-000000000001',
        'Desempeño del Conductor',
        2,
        '¿Cómo califica la seguridad y respeto a las normas de tránsito durante el viaje?',
        'Evalúe manejo defensivo y velocidad prudente',
        'ESCALA_1_5',
        TRUE,
        1.50,
        '{"min": 1, "max": 5, "etiquetaMin": "Inseguro", "etiquetaMax": "Muy seguro"}'::jsonb,
        TRUE,
        NOW(), NOW(), 'flyway-v187', 'flyway-v187'
    ),
    (
        'c2000000-0000-4000-a000-000000000003',
        'c1000000-0000-4000-a000-000000000001',
        'Vehículo y Servicio',
        3,
        '¿El vehículo se encontraba limpio y en condiciones adecuadas al iniciar el viaje?',
        NULL,
        'SI_NO',
        TRUE,
        1.00,
        NULL,
        TRUE,
        NOW(), NOW(), 'flyway-v187', 'flyway-v187'
    ),
    (
        'c2000000-0000-4000-a000-000000000004',
        'c1000000-0000-4000-a000-000000000001',
        'Vehículo y Servicio',
        4,
        '¿Cómo califica el trato y cordialidad del conductor?',
        NULL,
        'OPCION_UNICA',
        TRUE,
        1.00,
        NULL,
        TRUE,
        NOW(), NOW(), 'flyway-v187', 'flyway-v187'
    ),
    (
        'c2000000-0000-4000-a000-000000000005',
        'c1000000-0000-4000-a000-000000000001',
        'Observaciones',
        5,
        'Comentarios o sugerencias de mejora sobre el servicio recibido',
        'Opcional. Mencione aspectos destacables o incidencias relevantes.',
        'TEXTO_LARGO',
        FALSE,
        0.00,
        '{"maxLength": 1000}'::jsonb,
        TRUE,
        NOW(), NOW(), 'flyway-v187', 'flyway-v187'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO cuestionarios.pregunta_opciones (
    id, pregunta_id, orden, etiqueta, valor, puntaje, activo,
    created_at, updated_at, created_by, updated_by
)
VALUES
    ('c3000000-0000-4000-a000-000000000001', 'c2000000-0000-4000-a000-000000000004', 1, 'Excelente', 'EXCELENTE', 5.00, TRUE, NOW(), NOW(), 'flyway-v187', 'flyway-v187'),
    ('c3000000-0000-4000-a000-000000000002', 'c2000000-0000-4000-a000-000000000004', 2, 'Bueno',     'BUENO',     4.00, TRUE, NOW(), NOW(), 'flyway-v187', 'flyway-v187'),
    ('c3000000-0000-4000-a000-000000000003', 'c2000000-0000-4000-a000-000000000004', 3, 'Regular',   'REGULAR',   2.50, TRUE, NOW(), NOW(), 'flyway-v187', 'flyway-v187'),
    ('c3000000-0000-4000-a000-000000000004', 'c2000000-0000-4000-a000-000000000004', 4, 'Deficiente','DEFICIENTE',1.00, TRUE, NOW(), NOW(), 'flyway-v187', 'flyway-v187')
ON CONFLICT (id) DO NOTHING;
