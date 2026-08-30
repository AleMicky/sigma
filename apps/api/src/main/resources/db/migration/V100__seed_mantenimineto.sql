-- Limpiar tablas dependientes y catálogos de mantenimiento con CASCADE
TRUNCATE TABLE mantenimientos.prioridades, mantenimientos.tipos_mantenimiento CASCADE;

-- prioridades
INSERT INTO mantenimientos.prioridades (id, codigo, nombre, descripcion, nivel, created_at, updated_at, created_by, updated_by)
VALUES
    ('94c45c18-94a6-4e2f-b86e-7b369b366d14', 'ALTA', 'Alta', 'ALTA', 1, '2026-08-18 19:55:21.243293 +00:00', '2026-08-18 19:55:21.243293 +00:00', 'admin.sigma', 'admin.sigma'),
    ('99b40ff2-70e5-43fe-9df4-87264bc18a20', 'MEDIA', 'Media', 'MEDIA', 3, '2026-08-18 19:55:34.154155 +00:00', '2026-08-18 19:55:34.154155 +00:00', 'admin.sigma', 'admin.sigma'),
    ('a6fba331-c632-4e3b-8d50-2bb7fe30e5c1', 'NORMAL', 'Normal', 'NORMAL', 2, '2026-08-18 19:55:56.890947 +00:00', '2026-08-18 19:55:56.890947 +00:00', 'admin.sigma', 'admin.sigma');

-- tipos_mantenimiento
INSERT INTO mantenimientos.tipos_mantenimiento (id, codigo, nombre, descripcion, created_at, updated_at, created_by, updated_by)
VALUES
    ('5dda02de-0a06-493c-8630-194d330af904', 'PREVENTIVO', 'Preventivo', 'Preventivo', '2026-08-18 19:51:27.105196 +00:00', '2026-08-18 19:51:27.105196 +00:00', 'admin.sigma', 'admin.sigma'),
    ('6a786a98-845d-4139-96c4-6ba929796307', 'EMERGENCIA', 'Emergecia', 'Emergecia', '2026-08-18 19:51:59.910146 +00:00', '2026-08-18 19:51:59.910146 +00:00', 'admin.sigma', 'admin.sigma'),
    ('cccf2705-a512-4185-b09c-020043d2a159', 'CORRECTIVO', 'Correctivo', 'Correctivo', '2026-08-18 19:51:42.956474 +00:00', '2026-08-18 19:51:42.956474 +00:00', 'admin.sigma', 'admin.sigma'),
    ('b80bed4e-dbf3-4b16-b392-b12cbba69bfa', 'PREDICTIVO', 'Predictivo', 'Predictivo', '2026-08-18 19:55:03.932127 +00:00', '2026-08-18 19:55:03.932127 +00:00', 'admin.sigma', 'admin.sigma');