INSERT INTO organizacion.registros_migracion
    (id, sistema_origen, entidad, id_origen, id_destino, estado, mensaje, fecha_registro)
VALUES
    ('55555555-5555-4555-8555-555555555551', 'SIGA', 'Persona', 'PER-1001', '11111111-1111-4111-8111-111111111111', 'MIGRADO',    'Migración exitosa de persona',                          now() - interval '5 days'),
    ('55555555-5555-4555-8555-555555555552', 'SIGA', 'Persona', 'PER-1002', '11111111-1111-4111-8111-111111111112', 'MIGRADO',    'Migración exitosa de persona',                          now() - interval '5 days'),
    ('55555555-5555-4555-8555-555555555553', 'SIGA', 'Persona', 'PER-1003', '11111111-1111-4111-8111-111111111113', 'ERROR',      'No se pudo migrar: documento duplicado detectado',      now() - interval '4 days'),
    ('55555555-5555-4555-8555-555555555554', 'SIGA', 'Area',    'AREA-01', '22222222-2222-4222-8222-222222222221', 'MIGRADO',    'Migración exitosa de área',                             now() - interval '3 days'),
    ('55555555-5555-4555-8555-555555555555', 'SIGA', 'Cargo',   'CARGO-07', '33333333-3333-4333-8333-333333333337', 'ACTUALIZADO','Cargo actualizado luego de corrección manual',         now() - interval '2 days');