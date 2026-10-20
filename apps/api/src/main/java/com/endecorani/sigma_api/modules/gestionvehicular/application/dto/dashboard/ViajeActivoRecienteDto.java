package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.dashboard;

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
public class ViajeActivoRecienteDto {
    private UUID viajeId;
    private UUID solicitudId;
    private String numeroSolicitud;
    private String motivo;
    private String destino;
    private UUID activoId;
    private String vehiculoCodigo;
    private String placa;
    private String marcaModelo;
    private UUID conductorId;
    private String conductorNombre;
    private LocalDateTime fechaSalida;
    private LocalDateTime fechaRetornoEstimada;
    private String estado;
    private Long kilometrajeSalida;
}
