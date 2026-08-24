DO $$
DECLARE
    v_tipo_fallas_id UUID;
    v_motivo_id UUID;
BEGIN
    SELECT id INTO v_tipo_fallas_id FROM parametros.catalogos WHERE LOWER(codigo) = 'tipo_fallas' LIMIT 1;
    SELECT id INTO v_motivo_id FROM parametros.catalogos WHERE LOWER(codigo) = 'motivo_mantenimiento' LIMIT 1;

    IF v_tipo_fallas_id IS NULL AND v_motivo_id IS NOT NULL THEN
        UPDATE parametros.catalogos
        SET codigo = 'TIPO_FALLAS',
            nombre = 'Tipos de Falla'
        WHERE id = v_motivo_id;
    ELSIF v_tipo_fallas_id IS NOT NULL AND v_motivo_id IS NOT NULL THEN
        -- Eliminar items del catálogo antiguo
        DELETE FROM parametros.catalogo_items WHERE catalogo_id = v_motivo_id;

        -- Eliminar catálogo antiguo
        DELETE FROM parametros.catalogos WHERE id = v_motivo_id;
    END IF;
END $$;
