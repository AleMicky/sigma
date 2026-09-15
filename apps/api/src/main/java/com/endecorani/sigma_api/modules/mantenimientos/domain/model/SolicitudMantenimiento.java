package com.endecorani.sigma_api.modules.mantenimientos.domain.model;

import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SolicitudMantenimiento extends AuditableModel {

    private UUID id;
    private String numero;
    private Activo activo;

    // Clasificación
    private TipoMantenimiento tipoMantenimiento;
    private String tipoFallas;
    private Prioridad prioridad;

    // Solicitud
    private Empleado solicitante;
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaSolicitud;

    // Datos actuales del proceso
    private Empleado aprobador;
    private Empleado responsable;
    private Empleado supervisor;

    // Ejecución
    private LocalDateTime fechaInicioMantenimiento;
    private LocalDateTime fechaFinMantenimiento;

    // Cierre
    private LocalDateTime fechaCierre;

    // Flowable
    private String processInstanceId;
    private String estado;

    @Builder.Default
    private List<SolicitudMantenimientoAdjunto> adjuntos = new ArrayList<>();
}