package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Fila de la bitácora consolidada de vehículos (Formulario GA-IN7-04).
 * Origen:
 *  - SALIDA: Bitácora de salida vehicular (SalidaVehicular + eventos de odómetro).
 *  - SOLICITUD: Solicitud vehicular (SolicitudVehicular → AsignacionVehicular → ViajeVehicular).
 */
@Builder
public record BitacoraConsolidadaItemResponse(
        UUID id,
        String origen,
        String numero,
        Instant fecha,
        Integer dia,
        String fechaFormateada,
        String descripcionActividad,
        Long kmSalida,
        Long kmLlegada,
        Long kmRecorrido,
        String combustibleTexto,
        BigDecimal combustibleLitros,
        String combustibleFactura,
        String conductorNombre,
        String observaciones,
        String estado,
        UUID activoId,
        String vehiculoPlaca,
        String vehiculoCodigo
) {
}

