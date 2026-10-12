package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.response;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record BitacoraVehicularPeriodoInfo(
        LocalDate fechaInicio,
        LocalDate fechaFin,
        String mes,
        Integer anio
) {
}
