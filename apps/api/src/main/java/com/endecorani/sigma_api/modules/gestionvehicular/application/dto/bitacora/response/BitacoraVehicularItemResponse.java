package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record BitacoraVehicularItemResponse(
        UUID id,
        LocalDateTime fecha,
        Integer dia,
        String diaSemana,
        String tipoRegistro,
        Long kmSalida,
        Long kmLlegada,
        Long kmRecorrido,
        String descripcionTrabajo,
        UUID solicitudId,
        String solicitudNumero,
        String combustibleFactura,
        BigDecimal combustibleLitros,
        BigDecimal combustibleImporte,
        String supervisorNombre,
        Boolean supervisorVoBo,
        String observaciones,
        String conductorNombre,
        String conductorLicencia
) {
}
