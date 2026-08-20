-- Seed Catálogo: MOTIVO_MANTENIMIENTO
INSERT INTO parametros.catalogos (id, codigo, nombre, created_at, updated_at, created_by, updated_by)
VALUES (
    'ec16e04a-6dc6-4a03-987d-139ee2ccc41b',
    'MOTIVO_MANTENIMIENTO',
    'Motivo Mantenimiento',
    NOW(),
    NOW(),
    'system',
    'system'
)
ON CONFLICT (id) DO UPDATE SET
    codigo = EXCLUDED.codigo,
    nombre = EXCLUDED.nombre;

-- Seed Items del Catálogo MOTIVO_MANTENIMIENTO
INSERT INTO parametros.catalogo_items (id, catalogo_id, nombre, valor, orden, created_at, updated_at, created_by, updated_by)
VALUES
    ('402bcd05-0889-44ab-b0b5-f78b4b96f018', 'ec16e04a-6dc6-4a03-987d-139ee2ccc41b', 'Falla', 'FALLA', 0, NOW(), NOW(), 'system', 'system'),
    ('9867cc4a-41bf-4b22-9b59-aca04a212e87', 'ec16e04a-6dc6-4a03-987d-139ee2ccc41b', 'Avería', 'AVERIA', 1, NOW(), NOW(), 'system', 'system'),
    ('37454299-a92e-48a3-b004-b794bb3c3047', 'ec16e04a-6dc6-4a03-987d-139ee2ccc41b', 'Desgaste', 'DESGASTE', 2, NOW(), NOW(), 'system', 'system'),
    ('2d4846bd-d0d0-470f-8fcf-4a3ea3764764', 'ec16e04a-6dc6-4a03-987d-139ee2ccc41b', 'Accidente', 'ACCIDENTE', 3, NOW(), NOW(), 'system', 'system'),
    ('05ce9982-344a-43ff-8d13-1701bb1418fb', 'ec16e04a-6dc6-4a03-987d-139ee2ccc41b', 'Programado', 'PROGRAMADO', 4, NOW(), NOW(), 'system', 'system'),
    ('936cfec9-cf54-4007-a7e1-1e01f252c8f5', 'ec16e04a-6dc6-4a03-987d-139ee2ccc41b', 'Por medición', 'MEDICION', 5, NOW(), NOW(), 'system', 'system'),
    ('c619b64a-45f8-4708-b6e1-55eea94809d0', 'ec16e04a-6dc6-4a03-987d-139ee2ccc41b', 'Resultado de inspección', 'INSPECCION', 6, NOW(), NOW(), 'system', 'system'),
    ('d5528f3d-6815-4eb1-aa1f-c1e7d4448bb9', 'ec16e04a-6dc6-4a03-987d-139ee2ccc41b', 'Garantía', 'GARANTIA', 7, NOW(), NOW(), 'system', 'system'),
    ('40d008aa-2a11-4fbe-afaa-13299daf0510', 'ec16e04a-6dc6-4a03-987d-139ee2ccc41b', 'Recomendación técnica', 'RECOMENDACION_TECNICA', 8, NOW(), NOW(), 'system', 'system'),
    ('8a7d488b-adc1-4949-a03a-083856b99296', 'ec16e04a-6dc6-4a03-987d-139ee2ccc41b', 'Anomalía', 'ANOMALIA', 9, NOW(), NOW(), 'system', 'system'),
    ('6684dd30-642b-4ba9-99e6-5e72a4c4ff1e', 'ec16e04a-6dc6-4a03-987d-139ee2ccc41b', 'Mejora', 'MEJORA', 10, NOW(), NOW(), 'system', 'system')
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    valor = EXCLUDED.valor,
    orden = EXCLUDED.orden;
