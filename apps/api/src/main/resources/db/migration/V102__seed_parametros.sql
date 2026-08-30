-- 1. Limpiar todas las tablas con CASCADE al inicio
TRUNCATE TABLE
    parametros.catalogos,
    parametros.catalogo_items
    CASCADE;

-- 2. Catalogos
INSERT INTO parametros.catalogos (id, codigo, nombre, created_at, updated_at, created_by, updated_by) VALUES ('27400b55-4df5-401c-abd5-cd08641c318e', 'TIPO_FALLAS', 'Tipo de Fallas', '2026-08-14 22:02:57.619445 +00:00', '2026-08-14 22:03:30.090794 +00:00', 'admin.sigma', 'admin.sigma');
-- 3 Catalogo Items
INSERT INTO parametros.catalogo_items (id, catalogo_id, nombre, valor, orden, created_at, updated_at, created_by, updated_by) VALUES ('dcf6ed54-99a4-45f3-839d-f9cab54536a5', '27400b55-4df5-401c-abd5-cd08641c318e', 'Mecánica', 'Mecanica', 0, '2026-08-14 22:07:05.042263 +00:00', '2026-08-14 22:07:05.042263 +00:00', 'admin.sigma', 'admin.sigma');
INSERT INTO parametros.catalogo_items (id, catalogo_id, nombre, valor, orden, created_at, updated_at, created_by, updated_by) VALUES ('0f71db2d-26eb-4be9-b099-5cdb090954b1', '27400b55-4df5-401c-abd5-cd08641c318e', 'Eléctrica', 'Electrica', 1, '2026-08-14 22:07:43.264920 +00:00', '2026-08-14 22:07:43.264920 +00:00', 'admin.sigma', 'admin.sigma');
INSERT INTO parametros.catalogo_items (id, catalogo_id, nombre, valor, orden, created_at, updated_at, created_by, updated_by) VALUES ('b762222d-e39f-4633-96be-ca5a04dd9d31', '27400b55-4df5-401c-abd5-cd08641c318e', 'Electrónica', 'Electronica', 2, '2026-08-14 22:07:59.226489 +00:00', '2026-08-14 22:07:59.226489 +00:00', 'admin.sigma', 'admin.sigma');
INSERT INTO parametros.catalogo_items (id, catalogo_id, nombre, valor, orden, created_at, updated_at, created_by, updated_by) VALUES ('2913f6c3-5ab6-4016-a6ab-3ad2989c7dca', '27400b55-4df5-401c-abd5-cd08641c318e', 'Hidráulica', 'Hidraulica', 3, '2026-08-14 22:08:19.476179 +00:00', '2026-08-14 22:08:19.476179 +00:00', 'admin.sigma', 'admin.sigma');
INSERT INTO parametros.catalogo_items (id, catalogo_id, nombre, valor, orden, created_at, updated_at, created_by, updated_by) VALUES ('ff5583fd-e46a-4169-b2ee-b3088fbe92bc', '27400b55-4df5-401c-abd5-cd08641c318e', 'Neumática', 'Neumatica', 4, '2026-08-14 22:08:40.986154 +00:00', '2026-08-14 22:08:40.986154 +00:00', 'admin.sigma', 'admin.sigma');
INSERT INTO parametros.catalogo_items (id, catalogo_id, nombre, valor, orden, created_at, updated_at, created_by, updated_by) VALUES ('66c53972-20f4-4240-bedc-65d64bffa4f4', '27400b55-4df5-401c-abd5-cd08641c318e', 'Estructural', 'Estructural', 5, '2026-08-14 22:08:54.433757 +00:00', '2026-08-14 22:08:54.433757 +00:00', 'admin.sigma', 'admin.sigma');
INSERT INTO parametros.catalogo_items (id, catalogo_id, nombre, valor, orden, created_at, updated_at, created_by, updated_by) VALUES ('ea019c99-c9a0-4e35-8cb5-c7bc039d47ed', '27400b55-4df5-401c-abd5-cd08641c318e', 'Carroceria', 'Carroceria', 6, '2026-08-14 22:09:42.573058 +00:00', '2026-08-14 22:09:42.573058 +00:00', 'admin.sigma', 'admin.sigma');
INSERT INTO parametros.catalogo_items (id, catalogo_id, nombre, valor, orden, created_at, updated_at, created_by, updated_by) VALUES ('f131dcd9-3289-4ea5-9a6e-029888a31d73', '27400b55-4df5-401c-abd5-cd08641c318e', 'Seguridad', 'Seguridad', 7, '2026-08-14 22:09:56.891985 +00:00', '2026-08-14 22:09:56.891985 +00:00', 'admin.sigma', 'admin.sigma');

