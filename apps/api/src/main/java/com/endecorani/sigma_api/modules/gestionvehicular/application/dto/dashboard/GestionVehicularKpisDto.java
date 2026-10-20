package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GestionVehicularKpisDto {
    private int totalVehiculosFlota;
    private int vehiculosDisponibles;
    private int vehiculosEnViaje;
    private int vehiculosEnMantenimiento;
    private int vehiculosAsignados;

    private int totalConductores;
    private int conductoresActivos;
    private int licenciasPorVencer;

    private int solicitudesPendientes;
    private int solicitudesAprobadas;
    private int solicitudesEnCurso;

    private int viajesMesActual;
    private int viajesEnCurso;
    private long kmRecorridosMesActual;

    private BigDecimal combustibleLitrosMesActual;
    private BigDecimal combustibleCostoMesActual;
}
