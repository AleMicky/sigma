INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'INSPECCION_VISUAL', 'Inspección visual',
       'Inspección visual general para detectar daños, desgaste o anomalías.',
       true, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'INSPECCION_VISUAL'
);

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'LIMPIEZA', 'Limpieza',
       'Limpieza general del activo o de sus componentes.',
       true, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'LIMPIEZA'
);

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'PRUEBA_FUNCIONAMIENTO', 'Prueba de funcionamiento',
       'Verificación del correcto funcionamiento del activo después de una intervención.',
       true, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'PRUEBA_FUNCIONAMIENTO'
);

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'DIAGNOSTICO', 'Diagnóstico',
       'Evaluación técnica para determinar fallas, anomalías o causas de mal funcionamiento.',
       true, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'DIAGNOSTICO'
);

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'AJUSTE', 'Ajuste',
       'Ajuste de componentes o parámetros para asegurar el funcionamiento adecuado.',
       true, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'AJUSTE'
);

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'CAMBIO_ACEITE', 'Cambio de aceite',
       'Reemplazo del aceite utilizado por el activo o alguno de sus componentes.',
       false, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'CAMBIO_ACEITE'
);

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'CAMBIO_FILTRO', 'Cambio de filtro',
       'Reemplazo de filtros de aceite, aire, combustible u otros.',
       false, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'CAMBIO_FILTRO'
);

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'LUBRICACION', 'Lubricación',
       'Aplicación o reemplazo de lubricantes en componentes que lo requieran.',
       false, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'LUBRICACION'
);

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'REVISION_FRENOS', 'Revisión de frenos',
       'Inspección y verificación del sistema de frenado.',
       false, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'REVISION_FRENOS'
);

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'REVISION_ELECTRICA', 'Revisión eléctrica',
       'Inspección de conexiones, componentes y sistemas eléctricos.',
       false, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'REVISION_ELECTRICA'
);

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'LIMPIEZA_INTERNA', 'Limpieza interna',
       'Limpieza interna de componentes y eliminación de polvo o residuos.',
       false, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'LIMPIEZA_INTERNA'
);

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'CAMBIO_BATERIA', 'Cambio de batería',
       'Retiro y reemplazo de la batería del activo.',
       false, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'CAMBIO_BATERIA'
);

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'REEMPLAZO_COMPONENTE', 'Reemplazo de componente',
       'Sustitución de un componente defectuoso, dañado o desgastado.',
       false, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'REEMPLAZO_COMPONENTE'
);

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'CALIBRACION', 'Calibración',
       'Ajuste y verificación de parámetros de funcionamiento o medición.',
       false, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'CALIBRACION'
);

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'ACTUALIZACION_SOFTWARE', 'Actualización de software',
       'Actualización del software, firmware o sistema operativo del activo.',
       false, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'ACTUALIZACION_SOFTWARE'
);

INSERT INTO mantenimientos.actividades_mantenimiento (
    id, codigo, nombre, descripcion,
    aplica_todos_tipos_activo, requiere_checklist,
    created_at, created_by
)
SELECT gen_random_uuid(), 'CAMBIO_TONER', 'Cambio de tóner',
       'Reemplazo del tóner o consumible de impresión.',
       false, false, NOW(), 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.actividades_mantenimiento WHERE codigo = 'CAMBIO_TONER'
);
