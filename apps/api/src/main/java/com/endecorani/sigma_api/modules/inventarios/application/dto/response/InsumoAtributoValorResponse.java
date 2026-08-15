package com.endecorani.sigma_api.modules.inventarios.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "InsumoAtributoValorResponse",
        description = "Valor de un atributo asociado a un insumo"
)
public record InsumoAtributoValorResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Identificador del insumo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID insumoId,

        @Schema(
                description = "Identificador del atributo de tipo de insumo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID tipoInsumoAtributoId,

        @Schema(
                description = "Valor del atributo",
                example = "MARCA_A"
        )
        String valor,

        @Schema(description = "Fecha de creación")
        Instant createdAt,

        @Schema(description = "Fecha de última actualización")
        Instant updatedAt,

        @Schema(description = "Usuario que creó el registro")
        String createdBy,

        @Schema(description = "Usuario que actualizó el registro")
        String updatedBy
) {
}
