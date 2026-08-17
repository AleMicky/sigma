package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "ChecklistItemResponse",
        description = "Información de un item de checklist de mantenimiento"
)
public record ChecklistItemResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Información del checklist de mantenimiento"
        )
        ChecklistMantenimientoInfo checklistMantenimiento,

        @Schema(
                description = "Código del item",
                example = "ITEM-001"
        )
        String codigo,

        @Schema(
                description = "Nombre del item",
                example = "Nivel de aceite"
        )
        String nombre,

        @Schema(
                description = "Descripción del item",
                example = "Verificar que el nivel de aceite esté dentro del rango aceptable"
        )
        String descripcion,

        @Schema(
                description = "Información del tipo de dato"
        )
        TipoDatoInfo tipoDato,

        @Schema(
                description = "Orden del item",
                example = "1"
        )
        Integer orden,

        @Schema(
                description = "Indica si el item es obligatorio",
                example = "true"
        )
        Boolean obligatorio,

        @Schema(
                description = "Opciones del item en formato JSON"
        )
        String opciones,

        @Schema(
                description = "Datos de auditoría"
        )
        AuditoriaResponse auditoria
) {
    public record ChecklistMantenimientoInfo(
            @Schema(
                    description = "Identificador del checklist",
                    example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
            )
            UUID id,

            @Schema(
                    description = "Código del checklist",
                    example = "CHK-ACEITE-001"
            )
            String codigo,

            @Schema(
                    description = "Nombre del checklist",
                    example = "Checklist de cambio de aceite"
            )
            String nombre
    ) {
    }

    public record TipoDatoInfo(
            @Schema(
                    description = "Identificador del tipo de dato",
                    example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
            )
            UUID id,

            @Schema(
                    description = "Código del tipo de dato",
                    example = "text"
            )
            String codigo,

            @Schema(
                    description = "Nombre del tipo de dato",
                    example = "Texto"
            )
            String nombre
    ) {
    }
}
