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
    private UUID tipoFallaId;
    private UUID prioridadId;

    // Solicitud
    private UUID solicitanteId;
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaSolicitud;

    // Datos actuales del proceso
    private UUID aprobadorId;
    private UUID responsableId;
    private UUID supervisorId;

    // Ejecución
    private LocalDateTime fechaInicioMantenimiento;
    private LocalDateTime fechaFinMantenimiento;

    // Cierre
    private LocalDateTime fechaCierre;

    // Flowable
    private String processInstanceId;
    private String estado;
}