-- ============================================================================
-- Seed: módulo organizacion (10 registros por tabla)
-- ============================================================================

-- created_by común para trazabilidad de seeds
-- created_at = now() en cada inserción

-- ---------------------------------------------------------------------------
-- Personas (10)
-- ---------------------------------------------------------------------------
INSERT INTO organizacion.personas
    (id, tipo_documento, numero_documento, complemento, nombres, primer_apellido, segundo_apellido, fecha_nacimiento, telefono, correo, created_at, created_by)
VALUES
    ('11111111-1111-4111-8111-111111111111', 'CI', '1234567', '1A', 'Juan Carlos',          'Pérez',        'Gómez',      '1985-04-12', '+591 77711111', 'juan.perez@institucion.gob',      now(), 'seed'),
    ('11111111-1111-4111-8111-111111111112', 'CI', '7654321', NULL, 'María Fernanda',        'Quispe',       'Mamani',     '1990-08-23', '+591 77711112', 'maria.quispe@institucion.gob',    now(), 'seed'),
    ('11111111-1111-4111-8111-111111111113', 'CI', '2345678', NULL, 'Carlos Alberto',        'Rojas',        'Suárez',     '1982-01-30', '+591 77711113', 'carlos.rojas@institucion.gob',    now(), 'seed'),
    ('11111111-1111-4111-8111-111111111114', 'CI', '3456789', NULL, 'Ana Lucía',             'Flores',       'Ríos',       '1995-06-17', '+591 77711114', 'ana.flores@institucion.gob',      now(), 'seed'),
    ('11111111-1111-4111-8111-111111111115', 'CI', '4567890', NULL, 'Luis Fernando',         'Callisaya',    'Condori',    '1988-11-05', '+591 77711115', 'luis.callisaya@institucion.gob',  now(), 'seed'),
    ('11111111-1111-4111-8111-111111111116', 'CI', '5678901', NULL, 'Patricia Alejandra',    'Vargas',       'Lima',       '1992-03-22', '+591 77711116', 'patricia.vargas@institucion.gob', now(), 'seed'),
    ('11111111-1111-4111-8111-111111111117', 'CI', '6789012', NULL, 'Rodrigo Sebastián',     'Mercado',      'Flores',     '1987-09-14', '+591 77711117', 'rodrigo.mercado@institucion.gob', now(), 'seed'),
    ('11111111-1111-4111-8111-111111111118', 'CI', '7890123', NULL, 'Carmen Rosa',           'Apaza',        'Quispe',     '1993-12-01', '+591 77711118', 'carmen.apaza@institucion.gob',    now(), 'seed'),
    ('11111111-1111-4111-8111-111111111119', 'CI', '8901234', NULL, 'Diego Alejandro',       'Choquehuanca', 'Mamani',     '1991-07-19', '+591 77711119', 'diego.choque@institucion.gob',    now(), 'seed'),
    ('11111111-1111-4111-8111-11111111111a', 'CI', '9012345', NULL, 'Sofía Valentina',       'Cortez',       'Ríos',       '1996-02-08', '+591 7771111a', 'sofia.cortez@institucion.gob',    now(), 'seed');

-- ---------------------------------------------------------------------------
-- Áreas (10)
-- ---------------------------------------------------------------------------
INSERT INTO organizacion.areas
    (id, codigo, nombre, descripcion, created_at, created_by)
VALUES
    ('22222222-2222-4222-8222-222222222221', 'SISTEMAS',       'Sistemas',          'Área de tecnología y desarrollo de software',                 now(), 'seed'),
    ('22222222-2222-4222-8222-222222222222', 'RRHH',           'Recursos Humanos',  'Área de gestión de personal y nómina',                         now(), 'seed'),
    ('22222222-2222-4222-8222-222222222223', 'FINANZAS',       'Finanzas',          'Área de administración financiera y presupuesto',              now(), 'seed'),
    ('22222222-2222-4222-8222-222222222224', 'MARKETING',      'Marketing',         'Área de promoción y comunicación institucional',               now(), 'seed'),
    ('22222222-2222-4222-8222-222222222225', 'OPERACIONES',    'Operaciones',       'Área de procesos operativos y servicios',                     now(), 'seed'),
    ('22222222-2222-4222-8222-222222222226', 'LOGISTICA',      'Logística',         'Área de almacenes, inventario y distribución',                 now(), 'seed'),
    ('22222222-2222-4222-8222-222222222227', 'JURIDICA',       'Jurídica',          'Área de asesoría legal e instrumentos normativos',            now(), 'seed'),
    ('22222222-2222-4222-8222-222222222228', 'CONTABILIDAD',   'Contabilidad',      'Área de registro contable y conciliación',                    now(), 'seed'),
    ('22222222-2222-4222-8222-222222222229', 'ADMINISTRACION', 'Administración',    'Área de administración general y servicios auxiliares',         now(), 'seed'),
    ('22222222-2222-4222-8222-22222222222a', 'TECNOLOGIA',     'Tecnología',        'Área de infraestructura tecnológica y soporte',                now(), 'seed');

-- ---------------------------------------------------------------------------
-- Cargos (10)
-- ---------------------------------------------------------------------------
INSERT INTO organizacion.cargos
    (id, codigo, nombre, descripcion, created_at, created_by)
VALUES
    ('33333333-3333-4333-8333-333333333331', 'ANALISTA',     'Analista',     'Cargo de análisis técnico o funcional',                   now(), 'seed'),
    ('33333333-3333-4333-8333-333333333332', 'GERENTE',      'Gerente',      'Cargo de gerencia con responsabilidad directiva',         now(), 'seed'),
    ('33333333-3333-4333-8333-333333333333', 'SUPERVISOR',   'Supervisor',   'Cargo de supervisión de equipos operativos',              now(), 'seed'),
    ('33333333-3333-4333-8333-333333333334', 'ASISTENTE',    'Asistente',    'Cargo de apoyo administrativo',                            now(), 'seed'),
    ('33333333-3333-4333-8333-333333333335', 'COORDINADOR',  'Coordinador',  'Cargo de coordinación entre áreas y proyectos',            now(), 'seed'),
    ('33333333-3333-4333-8333-333333333336', 'JEFE',         'Jefe',         'Cargo de jefatura de unidad o departamento',              now(), 'seed'),
    ('33333333-3333-4333-8333-333333333337', 'TECNICO',      'Técnico',      'Cargo técnico especializado',                             now(), 'seed'),
    ('33333333-3333-4333-8333-333333333338', 'CONSULTOR',    'Consultor',    'Cargo de asesoría externa o consultoría experta',          now(), 'seed'),
    ('33333333-3333-4333-8333-333333333339', 'ENCARGADO',    'Encargado',    'Cargo de encargado de proceso o servicio',                now(), 'seed'),
    ('33333333-3333-4333-8333-33333333333a', 'ESPECIALISTA', 'Especialista', 'Cargo de especialización técnica o funcional',            now(), 'seed');

-- ---------------------------------------------------------------------------
-- Empleados (10) — FKs a personas, areas y cargos definidos arriba
-- ---------------------------------------------------------------------------
INSERT INTO organizacion.empleados
    (id, persona_id, area_id, cargo_id, codigo, fecha_inicio, fecha_fin, created_at, created_by)
VALUES
    ('44444444-4444-4444-8444-444444444441', '11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222221', '33333333-3333-4333-8333-333333333336', 'EMP-001', '2020-01-15', NULL,        now(), 'seed'),
    ('44444444-4444-4444-8444-444444444442', '11111111-1111-4111-8111-111111111112', '22222222-2222-4222-8222-222222222222', '33333333-3333-4333-8333-333333333333', 'EMP-002', '2021-03-01', NULL,        now(), 'seed'),
    ('44444444-4444-4444-8444-444444444443', '11111111-1111-4111-8111-111111111113', '22222222-2222-4222-8222-222222222223', '33333333-3333-4333-8333-333333333332', 'EMP-003', '2019-06-10', NULL,        now(), 'seed'),
    ('44444444-4444-4444-8444-444444444444', '11111111-1111-4111-8111-111111111114', '22222222-2222-4222-8222-222222222224', '33333333-3333-4333-8333-333333333331', 'EMP-004', '2022-08-01', NULL,        now(), 'seed'),
    ('44444444-4444-4444-8444-444444444445', '11111111-1111-4111-8111-111111111115', '22222222-2222-4222-8222-222222222225', '33333333-3333-4333-8333-333333333337', 'EMP-005', '2023-02-15', NULL,        now(), 'seed'),
    ('44444444-4444-4444-8444-444444444446', '11111111-1111-4111-8111-111111111116', '22222222-2222-4222-8222-222222222226', '33333333-3333-4333-8333-333333333334', 'EMP-006', '2021-11-20', NULL,        now(), 'seed'),
    ('44444444-4444-4444-8444-444444444447', '11111111-1111-4111-8111-111111111117', '22222222-2222-4222-8222-222222222227', '33333333-3333-4333-8333-333333333338', 'EMP-007', '2020-05-05', '2024-04-30', now(), 'seed'),
    ('44444444-4444-4444-8444-444444444448', '11111111-1111-4111-8111-111111111118', '22222222-2222-4222-8222-222222222228', '33333333-3333-4333-8333-333333333339', 'EMP-008', '2022-01-10', NULL,        now(), 'seed'),
    ('44444444-4444-4444-8444-444444444449', '11111111-1111-4111-8111-111111111119', '22222222-2222-4222-8222-222222222229', '33333333-3333-4333-8333-333333333335', 'EMP-009', '2023-09-01', NULL,        now(), 'seed'),
    ('44444444-4444-4444-8444-44444444444a', '11111111-1111-4111-8111-11111111111a', '22222222-2222-4222-8222-22222222222a', '33333333-3333-4333-8333-33333333333a', 'EMP-010', '2024-01-15', NULL,        now(), 'seed');