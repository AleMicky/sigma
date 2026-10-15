-- Modificar columna tipo_fallas a JSONB para soportar selección múltiple de tipos de falla
ALTER TABLE mantenimientos.solicitudes_mantenimiento
    ALTER COLUMN tipo_fallas TYPE JSONB
    USING (
        CASE
            WHEN tipo_fallas IS NULL OR TRIM(tipo_fallas) = '' THEN NULL
            WHEN tipo_fallas ~ '^\s*\[.*\]\s*$' THEN tipo_fallas::jsonb
            ELSE jsonb_build_array(tipo_fallas)
        END
    );
