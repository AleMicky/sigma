package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.reporte;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteSolicitudItemDto {
    private UUID id;
    private String numero;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaSalida;
    private LocalDateTime fechaRetornoEstimada;
    private Integer cantidadPasajeros;
    private String motivo;
    private String justificacion;
    private String destino;
    private String observacion;
    private String estado;

    // Solicitante
    private UUID solicitanteId;
    private String solicitanteCodigo;
    private String solicitanteNombre;
    private String solicitanteCargo;
    private String solicitanteArea;

    // Tipo de Solicitud
    private UUID tipoSolicitudId;
    private String tipoSolicitudCodigo;
    private String tipoSolicitudNombre;

    // Asignación
    private UUID asignacionId;
    private LocalDateTime fechaAsignacion;
    private String asignadoPorNombre;
    private String observacionAsignacion;

    // Activo / Vehículo asignado
    private UUID activoId;
    private String activoCodigo;
    private String activoNombre;
    private String activoPlaca;
    private String activoMarca;
    private String activoModelo;
    private String activoTipo;

    // Conductor asignado
    private UUID conductorId;
    private UUID conductorEmpleadoId;
    private String conductorNombre;
    private String conductorLicencia;
    private String conductorCategoria;
}

