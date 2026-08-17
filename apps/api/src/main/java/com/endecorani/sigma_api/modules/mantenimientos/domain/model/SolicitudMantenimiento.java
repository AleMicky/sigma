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

    private UUID tipoMantenimientoId;
    private UUID motivoMantenimiento;
    private UUID prioridadId;

    private UUID solicitanteId;
    private UUID areaSolicitanteId;

    private String titulo;
    private String descripcion;

    private LocalDateTime fechaSolicitud;

    private UUID aprobadoPorId;
    private LocalDateTime fechaAprobacion;
    private String observacionAprobacion;

    private UUID responsableId;
    private LocalDateTime fechaAsignacion;

    private LocalDateTime fechaInicioMantenimiento;
    private LocalDateTime fechaFinMantenimiento;

    private UUID supervisorId;
    private LocalDateTime fechaValidacion;
    private String observacionValidacion;

    private LocalDateTime fechaFinalizacion;
    private UUID recibidoPorId;
    private String observacionCierre;

    private String estado;
    private String processInstanceId;
}
