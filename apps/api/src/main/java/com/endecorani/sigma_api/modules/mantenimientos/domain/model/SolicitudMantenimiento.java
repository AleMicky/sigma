package com.endecorani.sigma_api.modules.mantenimientos.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SolicitudMantenimiento extends AuditableModel {

    private UUID id;
    private String numero;
    private UUID activoId;

    // Clasificación
    private UUID tipoMantenimientoId;
    private String tipoFallas;
    private UUID prioridadId;

    // Solicitud
    private UUID solicitanteId;
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaSolicitud;

    // Aprobación
    private UUID aprobadoPorId;
    private LocalDateTime fechaAprobacion;
    private LocalDateTime fechaEstimadaOt;
    private String observacionAprobacion;

    // Asignación
    private UUID responsableId;
    private LocalDateTime fechaAsignacion;

    // Ejecución
    private LocalDateTime fechaInicioMantenimiento;
    private LocalDateTime fechaFinMantenimiento;

    // Validación
    private UUID supervisorId;
    private LocalDateTime fechaValidacion;
    private String observacionValidacion;

    // Cierre
    private LocalDateTime fechaFinalizacion;
    private UUID recibidoPorId;
    private String observacionCierre;

    // Workflow
    private String estado;
    private String processInstanceId;
}
