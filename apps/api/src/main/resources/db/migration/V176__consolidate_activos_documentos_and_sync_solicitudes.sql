-- ============================================================================
-- Migración: V176__consolidate_activos_documentos_and_sync_solicitudes.sql
-- Descripción:
--   1. Migra cualquier registro existente de la tabla legacy activos.documentos
--      hacia activos.activo_documento y elimina activos.documentos.
--   2. Sincroniza activo_id, conductor_asignado_id y responsable_asignacion_id
--      en gestion_vehicular.solicitudes_vehiculares desde su asignación activa.
-- ============================================================================

-- 1. Consolidar activos.documentos → activos.activo_documento
DO $$
BEGIN
    IF to_regclass('activos.documentos') IS NOT NULL THEN
        INSERT INTO activos.activo_documento (
            id,
            activo_id,
            tipo_documento_id,
            numero_documento,
            nombre,
            descripcion,
            fecha_emision,
            fecha_vencimiento,
            nombre_archivo,
            ruta_archivo,
            mime_type,
            size,
            created_at,
            updated_at,
            created_by,
            updated_by,
            created_by_id,
            updated_by_id
        )
        SELECT
            d.id,
            d.activo_id,
            d.tipo_documento_id,
            NULL,
            d.nombre,
            d.descripcion,
            d.fecha_documento,
            d.fecha_vencimiento,
            COALESCE(NULLIF(d.nombre_archivo, ''), NULLIF(d.nombre_original, ''), d.nombre),
            COALESCE(d.ruta, ''),
            d.mime_type,
            d.tamano_bytes,
            d.created_at,
            d.updated_at,
            d.created_by,
            d.updated_by,
            d.created_by_id,
            d.updated_by_id
        FROM activos.documentos d
        WHERE NOT EXISTS (
            SELECT 1 FROM activos.activo_documento ad WHERE ad.id = d.id
        );

        DROP TABLE activos.documentos CASCADE;
    END IF;
END $$;

-- 2. Sincronizar campos denormalizados de solicitudes_vehiculares desde asignaciones_vehiculares
UPDATE gestion_vehicular.solicitudes_vehiculares sv
SET
    activo_id = COALESCE(sv.activo_id, latest.activo_id),
    conductor_asignado_id = COALESCE(sv.conductor_asignado_id, latest.conductor_id),
    responsable_asignacion_id = COALESCE(sv.responsable_asignacion_id, latest.asignado_por_id)
FROM (
    SELECT DISTINCT ON (av.solicitud_vehicular_id)
        av.solicitud_vehicular_id,
        av.activo_id,
        av.conductor_id,
        av.asignado_por_id
    FROM gestion_vehicular.asignaciones_vehiculares av
    ORDER BY av.solicitud_vehicular_id, av.fecha_asignacion DESC, av.created_at DESC
) latest
WHERE sv.id = latest.solicitud_vehicular_id
  AND (
      sv.activo_id IS NULL
      OR sv.conductor_asignado_id IS NULL
      OR sv.responsable_asignacion_id IS NULL
  );
