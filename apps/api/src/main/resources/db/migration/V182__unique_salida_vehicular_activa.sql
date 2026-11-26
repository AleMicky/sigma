-- ============================================================================
-- Migración: V182__unique_salida_vehicular_activa.sql
-- Descripción: REQ-VEH-010. Deduplica salidas activas por activo conservando la
--              más reciente y crea un índice UNIQUE parcial que impide una
--              segunda salida activa del mismo vehículo. No modifica V175.
-- ============================================================================

-- Se conserva la salida más reciente de cada activo (COALESCE(fecha, created_at)
-- con desempate por created_at/id). Las anteriores se cierran como FINALIZADA
-- en lugar de borrarse, para no romper las FK de eventos, bitácoras y portería.
WITH activas AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY activo_id
            ORDER BY COALESCE(fecha, created_at) DESC, created_at DESC, id DESC
        ) AS rn
    FROM gestion_vehicular.salidas_vehiculares
    WHERE UPPER(estado) NOT IN ('LLEGADA', 'FINALIZADA', 'CANCELADA', 'FINALIZADO', 'CANCELADO')
)
UPDATE gestion_vehicular.salidas_vehiculares s
SET estado = 'FINALIZADA',
    updated_at = COALESCE(updated_at, NOW())
FROM activas a
WHERE s.id = a.id
  AND a.rn > 1;

-- Mismo predicado que SpringSalidaVehicularRepository.findActivas() y que la
-- validación de SalidaVehicularService.registrar().
CREATE UNIQUE INDEX IF NOT EXISTS uq_salida_vehicular_activa_por_activo
    ON gestion_vehicular.salidas_vehiculares (activo_id)
    WHERE UPPER(estado) NOT IN ('LLEGADA', 'FINALIZADA', 'CANCELADA', 'FINALIZADO', 'CANCELADO');
