package com.endecorani.sigma_api.modules.activos.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(
        name = "ActivoAtributoValorRequest",
        description = "Datos para registrar o actualizar el valor de un atributo de un activo"
)
public record ActivoAtributoValorRequest(
        @Schema(
                description = "Identificador del activo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El activo es obligatorio")
        UUID activoId,

        @Schema(
                description = "Identificador del atributo de activo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El atributo de activo es obligatorio")
        UUID activoAtributoId,

        @Schema(
                description = "Valor del atributo para el activo",
                example = "GASOLINA"
        )
        @Size(
                max = 4000,
                message = "El valor no puede superar los 4000 caracteres"
        )
        String valor
) {
}
