package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GestionVehicularDashboardResponse {
    private GestionVehicularKpisDto kpis;
    private List<TendenciaViajesDto> tendenciaViajesYKm;
    private List<TendenciaCombustibleDto> tendenciaCombustible;
    private List<DistribucionEstadoDto> distribucionFlota;
    private List<DistribucionEstadoDto> distribucionSolicitudes;
    private List<TopVehiculoKmDto> topVehiculosRecorrido;
    private List<TopVehiculoCombustibleDto> topVehiculosCombustible;
    private List<ViajeActivoRecienteDto> viajesActivosRecientes;
    private List<AlertaLicenciaConductorDto> alertasLicencias;
}
