package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.reporte;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteSolicitudesGeneralResponse {
    private long totalSolicitudes;
    private long solicitudesBorrador;
    private long solicitudesPendientes;
    private long solicitudesAsignadas;
    private long solicitudesEnCurso;
    private long solicitudesFinalizadas;
    private long solicitudesRechazadas;
    private long totalPasajeros;
    private List<ReporteSolicitudItemDto> items;
}

