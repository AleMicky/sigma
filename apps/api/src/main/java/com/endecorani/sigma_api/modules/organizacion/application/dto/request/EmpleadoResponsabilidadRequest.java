package com.endecorani.sigma_api.modules.organizacion.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

@Schema(
        name = "EmpleadoResponsabilidadRequest",
        description = "Datos necesarios para registrar o actualizar la asignación de una responsabilidad a un empleado"
)
public record EmpleadoResponsabilidadRequest(
        @Schema(
                description = "Identificador del empleado",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El empleado es obligatorio")
        UUID empleadoId,

        @Schema(
                description = "Identificador de la responsabilidad",
                example = "8f9347gd-7ebb-5925-c8e1-b6e1e48494e9",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La responsabilidad es obligatoria")
        UUID responsabilidadId,

        @Schema(
                description = "Fecha de inicio de la asignación",
                example = "2026-01-01",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La fecha de inicio es obligatoria")
        LocalDate fechaInicio,

        @Schema(
                description = "Fecha de fin de la asignación",
                example = "2026-12-31"
        )
        LocalDate fechaFin
) {
}
