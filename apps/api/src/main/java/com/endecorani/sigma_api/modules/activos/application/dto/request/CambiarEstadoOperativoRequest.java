package com.endecorani.sigma_api.modules.activos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "CambiarEstadoOperativoRequest",
        description = "Petición para cambiar el estado operativo de un activo"
)
public record CambiarEstadoOperativoRequest(
        @Schema(
                description = "ID del estado operativo al que transiciona el activo",
                example = "e1a10000-0000-4000-a000-000000000001"
        )
        UUID estadoOperativoId,

        @Schema(
                description = "Código del estado operativo (alternativo al ID, ej. OPERATIVO, MANTENIMIENTO, EN_VIAJE, FUERA_SERVICIO, RESERVA, DE_BAJA)",
                example = "MANTENIMIENTO"
        )
        String codigoEstado,

        @Schema(
                description = "Observación o motivo opcional del cambio",
                example = "Ingreso por mantenimiento preventivo o asignación vehicular"
        )
        String observacion
) {
}
