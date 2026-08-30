ALTER TABLE mantenimientos.prioridades
    ADD COLUMN por_defecto BOOLEAN NOT NULL DEFAULT FALSE;

-- Establecer NORMAL como por defecto si existe y ninguno tiene por defecto
UPDATE mantenimientos.prioridades
SET por_defecto = TRUE
WHERE codigo = 'NORMAL';

-- Garantizar a nivel de base de datos que solo exista un registro con por_defecto = TRUE
CREATE UNIQUE INDEX uk_prioridades_por_defecto_true
    ON mantenimientos.prioridades (por_defecto)
    WHERE por_defecto = TRUE;
