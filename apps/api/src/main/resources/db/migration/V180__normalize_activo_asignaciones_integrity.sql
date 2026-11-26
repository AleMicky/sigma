-- ============================================================================
-- Migración: V180__normalize_activo_asignaciones_integrity.sql
-- Descripción: Normaliza las asignaciones históricas de activos y activa las
--              restricciones de integridad (REQ-BIZ-002) con validación
--              completa y sin avisos que silencien fallos: si quedan datos
--              inválidos, la migración falla.
-- ============================================================================

-- 1) Rangos inválidos: se cierra la asignación en su propia fecha de inicio,
--    conservando el registro y haciendo explícita la fecha de devolución.
UPDATE activos.activo_asignaciones
SET fecha_devolucion = fecha_asignacion,
    updated_at = NOW(),
    updated_by = COALESCE(updated_by, 'flyway-v180')
WHERE fecha_devolucion IS NOT NULL
  AND fecha_devolucion < fecha_asignacion;

-- 2) Destinatario duplicado: prevalece el empleado sobre el área.
UPDATE activos.activo_asignaciones
SET area_id = NULL,
    updated_at = NOW(),
    updated_by = COALESCE(updated_by, 'flyway-v180')
WHERE empleado_id IS NOT NULL
  AND area_id IS NOT NULL;

-- 3) Sin destinatario: son asignaciones huérfanas (empleado/área eliminados
--    por los FK ON DELETE SET NULL). Se conservan como historial cerrado para
--    no perder información, pero dejan de estar abiertas.
UPDATE activos.activo_asignaciones
SET fecha_devolucion = GREATEST(fecha_asignacion, COALESCE(fecha_devolucion, fecha_asignacion)),
    updated_at = NOW(),
    updated_by = COALESCE(updated_by, 'flyway-v180')
WHERE empleado_id IS NULL
  AND area_id IS NULL;

-- 4) Varias asignaciones abiertas para un mismo activo: se conserva la más
--    reciente y se cierran las restantes en el inicio de la conservada.
WITH keeper AS (
    SELECT DISTINCT ON (activo_id)
           id AS keeper_id,
           activo_id,
           fecha_asignacion AS keeper_fecha
    FROM activos.activo_asignaciones
    WHERE fecha_devolucion IS NULL
    ORDER BY activo_id, fecha_asignacion DESC, created_at DESC, id DESC
)
UPDATE activos.activo_asignaciones a
SET fecha_devolucion = GREATEST(a.fecha_asignacion, keeper.keeper_fecha),
    updated_at = NOW(),
    updated_by = COALESCE(updated_by, 'flyway-v180')
FROM keeper
WHERE a.fecha_devolucion IS NULL
  AND a.activo_id = keeper.activo_id
  AND a.id <> keeper.keeper_id;

-- 5) CHECK totalmente validados. Aquí se reconstruyen sin excluir filas
--    antiguas de la validación, por lo que cualquier fila inválida restante
--    provoca el fallo de la migración (no un aviso silencioso).
ALTER TABLE activos.activo_asignaciones
    DROP CONSTRAINT IF EXISTS chk_activo_asignaciones_fechas;
ALTER TABLE activos.activo_asignaciones
    ADD CONSTRAINT chk_activo_asignaciones_fechas
    CHECK (fecha_devolucion IS NULL OR fecha_devolucion >= fecha_asignacion);

-- El destinatario debe ser exactamente uno. Se toleran únicamente filas
-- históricas sin destinatario que ya estén cerradas (paso 3); las nuevas
-- siempre pasan por la validación del servicio.
ALTER TABLE activos.activo_asignaciones
    DROP CONSTRAINT IF EXISTS chk_activo_asignaciones_destinatario;
ALTER TABLE activos.activo_asignaciones
    ADD CONSTRAINT chk_activo_asignaciones_destinatario
    CHECK (
        ((empleado_id IS NULL) <> (area_id IS NULL))
        OR (empleado_id IS NULL AND area_id IS NULL AND fecha_devolucion IS NOT NULL)
    );

-- 6) Índice parcial único de asignación abierta: se recrea siempre para que
--    un duplicado restante haga fallar CREATE UNIQUE INDEX, sin NOTICE.
DROP INDEX IF EXISTS activos.uq_activo_asignaciones_activa;
CREATE UNIQUE INDEX uq_activo_asignaciones_activa
    ON activos.activo_asignaciones (activo_id)
    WHERE fecha_devolucion IS NULL;
