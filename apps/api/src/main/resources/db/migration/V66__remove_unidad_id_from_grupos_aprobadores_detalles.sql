DELETE FROM organizacion.grupos_aprobadores_detalles
WHERE tipo_aprobador = 'UNIDAD'
   OR alcance = 'UNIDAD_ESPECIFICA';

ALTER TABLE organizacion.grupos_aprobadores_detalles
    DROP COLUMN unidad_id;
