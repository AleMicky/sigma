-- Categorías de insumo generales
-- Soporta ejecución en orden (antes de V48, sin columna tipo_insumo_id)
-- y ejecución out-of-order en entornos dev (después de V48, con tipo_insumo_id NOT NULL).

DO $$
DECLARE
    v_has_tipo_insumo_id BOOLEAN;
    v_tipo_insumo_id UUID;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'inventarios'
          AND table_name = 'categorias_insumo'
          AND column_name = 'tipo_insumo_id'
    ) INTO v_has_tipo_insumo_id;

    IF v_has_tipo_insumo_id THEN
        SELECT id
        INTO v_tipo_insumo_id
        FROM inventarios.tipos_insumo
        ORDER BY CASE WHEN LOWER(codigo) = 'otro' THEN 0 ELSE 1 END, created_at, id
        LIMIT 1;

        IF v_tipo_insumo_id IS NULL THEN
            v_tipo_insumo_id := 'a1b2c3d4-e5f6-4012-8003-000000000005'::UUID;

            INSERT INTO inventarios.tipos_insumo (
                id, codigo, nombre, descripcion, created_at, created_by
            )
            SELECT
                v_tipo_insumo_id,
                'OTRO',
                'Otro',
                'Insumos que no encajan en las categorías anteriores.',
                TIMESTAMPTZ '2026-01-01 00:00:00+00',
                'system'
            WHERE NOT EXISTS (
                SELECT 1
                FROM inventarios.tipos_insumo t
                WHERE t.id = v_tipo_insumo_id OR LOWER(t.codigo) = LOWER('OTRO')
            );
        END IF;

        INSERT INTO inventarios.categorias_insumo (
            id, tipo_insumo_id, codigo, nombre, descripcion, created_at, created_by
        )
        SELECT
            v.id,
            v_tipo_insumo_id,
            v.codigo,
            v.nombre,
            v.descripcion,
            TIMESTAMPTZ '2026-01-01 00:00:00+00',
            'system'
        FROM (
            VALUES
                ('a1b2c3d4-e5f6-4012-8002-000000000001'::UUID, 'ALIMENTOS', 'Alimentos', 'Insumos alimenticios'),
                ('a1b2c3d4-e5f6-4012-8002-000000000002'::UUID, 'BEBIDAS', 'Bebidas', 'Insumos de bebidas'),
                ('a1b2c3d4-e5f6-4012-8002-000000000003'::UUID, 'LIMPIEZA', 'Limpieza', 'Insumos de limpieza y aseo'),
                ('a1b2c3d4-e5f6-4012-8002-000000000004'::UUID, 'PAPELERIA', 'Papelería', 'Insumos de papelería y oficina'),
                ('a1b2c3d4-e5f6-4012-8002-000000000005'::UUID, 'HERRAMIENTAS', 'Herramientas', 'Herramientas y utensilios')
        ) AS v(id, codigo, nombre, descripcion)
        WHERE NOT EXISTS (
            SELECT 1
            FROM inventarios.categorias_insumo c
            WHERE c.id = v.id OR LOWER(c.codigo) = LOWER(v.codigo)
        );
    ELSE
        INSERT INTO inventarios.categorias_insumo (
            id, codigo, nombre, descripcion, created_at, created_by
        )
        SELECT
            v.id,
            v.codigo,
            v.nombre,
            v.descripcion,
            TIMESTAMPTZ '2026-01-01 00:00:00+00',
            'system'
        FROM (
            VALUES
                ('a1b2c3d4-e5f6-4012-8002-000000000001'::UUID, 'ALIMENTOS', 'Alimentos', 'Insumos alimenticios'),
                ('a1b2c3d4-e5f6-4012-8002-000000000002'::UUID, 'BEBIDAS', 'Bebidas', 'Insumos de bebidas'),
                ('a1b2c3d4-e5f6-4012-8002-000000000003'::UUID, 'LIMPIEZA', 'Limpieza', 'Insumos de limpieza y aseo'),
                ('a1b2c3d4-e5f6-4012-8002-000000000004'::UUID, 'PAPELERIA', 'Papelería', 'Insumos de papelería y oficina'),
                ('a1b2c3d4-e5f6-4012-8002-000000000005'::UUID, 'HERRAMIENTAS', 'Herramientas', 'Herramientas y utensilios')
        ) AS v(id, codigo, nombre, descripcion)
        WHERE NOT EXISTS (
            SELECT 1
            FROM inventarios.categorias_insumo c
            WHERE c.id = v.id OR LOWER(c.codigo) = LOWER(v.codigo)
        );
    END IF;
END $$;
