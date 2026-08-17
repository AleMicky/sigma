package com.endecorani.sigma_api.modules.inventarios.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(
        name = "TipoInsumoAtributoRequest",
        description = "Datos necesarios para registrar o actualizar un atributo de tipo de insumo"
)
public record TipoInsumoAtributoRequest(
        @Schema(
                description = "Identificador del tipo de dato",
                example = "a1b2c3d4-e5f6-4011-8001-000000000008",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El tipo de dato es obligatorio")
        UUID tipoDatoId,

        @Schema(
                description = "Identificador del tipo de insumo al que pertenece",
                example = "a1b2c3d4-e5f6-4012-8003-000000000001",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El tipo de insumo es obligatorio")
        UUID tipoInsumoId,

        @Schema(
                description = "Código único del atributo dentro del tipo de insumo",
                example = "MARCA",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del atributo es obligatorio")
        @Size(
                min = 2,
                max = 50,
                message = "El código debe tener entre 2 y 50 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre del atributo",
                example = "Marca",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del atributo es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Indica si el atributo es obligatorio",
                example = "true"
        )
        Boolean requerido,

        @Schema(
                description = "Orden de visualización",
                example = "1"
        )
        Integer orden,

        @Schema(
                description = "Opciones configuradas en formato JSON para el atributo",
                example = "[\"Opción 1\", \"Opción 2\"]"
        )
        String opciones
) {
}
