-- ============================================================================
-- Seed: ubicaciones jerárquicas (Bolombia → Cochabamba → Endecorani)
-- ============================================================================

INSERT INTO parametros.ubicaciones
    (id, codigo, nombre, descripcion, tipo, ubicacion_padre_id, direccion, latitud, longitud, created_at, created_by)
VALUES
    -- País: Bolivia (raíz)
    ('b1b2c3d4-e5f6-4011-8001-000000000001',
     'BO', 'Bolivia', 'Estado Plurinacional de Bolivia', 'PAIS',
     NULL, NULL, -16.2901540, -63.5886520, now(), 'seed'),

    -- Departamento: Cochabamba (hijo de Bolivia)
    ('b1b2c3d4-e5f6-4011-8001-000000000002',
     'CBB', 'Cochabamba', 'Departamento de Cochabamba', 'DEPARTAMENTO',
     'b1b2c3d4-e5f6-4011-8001-000000000001', NULL, -17.3895000, -66.1568000, now(), 'seed'),

    -- Edificio: Endecorani (hijo de Cochabamba)
    ('b1b2c3d4-e5f6-4011-8001-000000000003',
     'END-CBB', 'Edificio Endecorani', 'Edificio principal de Endecorani en Cochabamba', 'EDIFICIO',
     'b1b2c3d4-e5f6-4011-8001-000000000002',
     'Av. Blanco Galindo Km 7.5, Cochabamba', -17.3935000, -66.1705000, now(), 'seed');