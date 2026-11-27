-- ============================================================================
-- Migración: V184__unique_programacion_activa.sql
-- Descripción: REQ-MANT-010. Deduplica programaciones activas por asignación de
--              activo al plan conservando la más reciente y crea un índice UNIQUE
--              parcial que impide una segunda programación activa. No modifica
--              V148: el historial se conserva (REQ-MANT-011 lo protege en servicio).
-- ============================================================================

-- Las anteriores se desactivan en lugar de borrarse para no romper las FK de
-- criterios e historial (V148:40 y V148:70-73, ambas ON DELETE CASCADE).
WITH activas AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY plan_mantenimiento_activo_id
            ORDER BY COALESCE(updated_at, created_at) DESC, created_at DESC, id DESC
        ) AS rn
    FROM mantenimientos.programaciones_mantenimiento
    WHERE activo = TRUE
)
UPDATE mantenimientos.programaciones_mantenimiento p
SET activo = FALSE,
    updated_at = COALESCE(updated_at, NOW())
FROM activas a
WHERE p.id = a.id
  AND a.rn > 1;

-- Mismo predicado que ProgramacionMantenimientoRepository
-- existsByPlanMantenimientoActivoIdAndActivoTrue y que las validaciones de
-- ProgramacionMantenimientoService.create/activar.
CREATE UNIQUE INDEX IF NOT EXISTS uq_programacion_activa_por_plan_activo
    ON mantenimientos.programaciones_mantenimiento (plan_mantenimiento_activo_id)
    WHERE activo = TRUE;
