package com.endecorani.sigma_api.modules.inventarios.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(
        name = "InsumoAtributoValorRequest",
        description = "Datos para registrar o actualizar el valor de un atributo de un insumo"
)
public record InsumoAtributoValorRequest(
        @Schema(
                description = "Identificador del insumo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El insumo es obligatorio")
        UUID insumoId,

        @Schema(
                description = "Identificador del atributo de tipo de insumo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El atributo de tipo de insumo es obligatorio")
        UUID tipoInsumoAtributoId,

        @Schema(
                description = "Valor del atributo para el insumo",
                example = "MARCA_A"
        )
        @Size(
                max = 500,
                message = "El valor no puede superar los 500 caracteres"
        )
        String valor
) {
}
