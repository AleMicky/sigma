CREATE OR REPLACE VIEW organizacion.vempleados AS
SELECT emp.id                                                                               AS empleado_id,
       emp.codigo,
       TRIM(CONCAT_WS(' ', per.nombres, per.primer_apellido, NULLIF(TRIM(per.segundo_apellido), ''))) AS nombre_completo,
       car.nombre                                                                           AS cargo,
       are.nombre                                                                           AS area
FROM organizacion.empleados emp
         JOIN organizacion.personas per ON per.id = emp.persona_id
         JOIN organizacion.cargos car ON car.id = emp.cargo_id
         JOIN organizacion.areas are ON are.id = emp.area_id;
