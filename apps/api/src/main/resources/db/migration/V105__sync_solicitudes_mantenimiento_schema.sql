-- Añadir las restricciones de Foreign Key para los empleados (solicitante, aprobador, responsable, supervisor)
-- hacia la tabla organizacion.empleados.

-- Limpiamos los datos basura existentes que podrían violar las foreign keys
DELETE FROM mantenimientos.solicitud_mantenimiento_adjuntos;
DELETE FROM mantenimientos.solicitudes_mantenimiento;

ALTER TABLE mantenimientos.solicitudes_mantenimiento
    ADD CONSTRAINT fk_solicitud_mantenimiento_solicitante 
    FOREIGN KEY (solicitante_id) REFERENCES organizacion.empleados (id);

ALTER TABLE mantenimientos.solicitudes_mantenimiento
    ADD CONSTRAINT fk_solicitud_mantenimiento_responsable 
    FOREIGN KEY (responsable_id) REFERENCES organizacion.empleados (id);

ALTER TABLE mantenimientos.solicitudes_mantenimiento
    ADD CONSTRAINT fk_solicitud_mantenimiento_supervisor 
    FOREIGN KEY (supervisor_id) REFERENCES organizacion.empleados (id);

-- Para el aprobador, notamos que la columna original en V47 se llamaba "aprobado_por_id".
-- La renombramos a "aprobador_id" para que coincida exactamente con la Entity que armamos,
-- y le añadimos su Foreign Key.
ALTER TABLE mantenimientos.solicitudes_mantenimiento
    RENAME COLUMN aprobado_por_id TO aprobador_id;

ALTER TABLE mantenimientos.solicitudes_mantenimiento
    ADD CONSTRAINT fk_solicitud_mantenimiento_aprobador 
    FOREIGN KEY (aprobador_id) REFERENCES organizacion.empleados (id);

-- Renombrar fecha_finalizacion a fecha_cierre para coincidir con la Entity
ALTER TABLE mantenimientos.solicitudes_mantenimiento
    RENAME COLUMN fecha_finalizacion TO fecha_cierre;
