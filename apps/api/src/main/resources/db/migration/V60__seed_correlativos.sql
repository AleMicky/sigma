INSERT INTO parametros.correlativos (id, codigo, gestion, ultimo_numero, prefijo, longitud)
VALUES
    (gen_random_uuid(), 'SOLICITUD_MANTENIMIENTO', 2026, 0, 'SM', 4),
    (gen_random_uuid(), 'ORDEN_TRABAJO', 2026, 0, 'OT', 4),
    (gen_random_uuid(), 'ACTIVO', 2026, 0, 'ACT', 5)
ON CONFLICT (codigo, gestion) DO NOTHING;
