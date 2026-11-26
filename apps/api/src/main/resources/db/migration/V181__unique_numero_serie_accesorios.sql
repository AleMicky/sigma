-- ============================================================================
-- Migración: V181__unique_numero_serie_accesorios.sql
-- Descripción: unicidad de numero_serie por accesorio (REQ-BIZ-005) mediante
--              índice parcial sobre (accesorio_id, upper(trim(numero_serie)))
--              WHERE numero_serie IS NOT NULL.
--
-- Aprendizaje de V180: no se usa NOT VALID ni bloques con RAISE NOTICE. Si
-- quedara cualquier duplicado, CREATE UNIQUE INDEX falla y la migración se
-- detiene; no hay avisos que oculten la violación. Tampoco se usa
-- CREATE INDEX IF NOT EXISTS: hace falta que el índice se cree de verdad.
-- ============================================================================

-- 1) Los espacios en blanco no son números de serie: se normalizan a NULL para
--    que el índice parcial no limite las filas históricas sin serie real.
UPDATE activos.activo_accesorios
SET numero_serie = NULL,
    updated_at = NOW(),
    updated_by = COALESCE(updated_by, 'flyway-v181')
WHERE numero_serie IS NOT NULL
  AND trim(numero_serie) = '';

-- 2) Duplicados históricos (mismo accesorio e igual serie tras upper/trim):
--    se conserva el registro más reciente y se deja NULL la serie de los
--    demás. No se eliminan filas ni se pierde el resto de la información.
WITH duplicados AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY accesorio_id, upper(trim(numero_serie))
               ORDER BY created_at DESC, id DESC
           ) AS fila
    FROM activos.activo_accesorios
    WHERE numero_serie IS NOT NULL
)
UPDATE activos.activo_accesorios aa
SET numero_serie = NULL,
    updated_at = NOW(),
    updated_by = COALESCE(updated_by, 'flyway-v181')
FROM duplicados d
WHERE aa.id = d.id
  AND d.fila > 1;

-- 3) Índice parcial único. Sin IF NOT EXISTS ni NOT VALID: cualquier
--    duplicado remanente provoca el fallo explícito de la migración.
CREATE UNIQUE INDEX uq_activo_accesorios_numero_serie
    ON activos.activo_accesorios (accesorio_id, upper(trim(numero_serie)))
    WHERE numero_serie IS NOT NULL;
