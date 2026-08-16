package com.endecorani.sigma_api.modules.activos.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

@Schema(
        name = "ActivoAtributoRequest",
        description = "Datos necesarios para registrar o actualizar un atributo de tipo de activo"
)
public record ActivoAtributoRequest(
        @Schema(
                description = "Identificador del tipo de activo al que pertenece",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El tipo de activo es obligatorio")
        UUID tipoActivoId,

        @Schema(
                description = "Código único del atributo dentro del tipo de activo",
                example = "TIPO_COMBUSTIBLE",
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
                description = "Etiqueta visible del atributo",
                example = "Tipo de combustible",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "La etiqueta del atributo es obligatoria")
        @Size(
                min = 2,
                max = 100,
                message = "La etiqueta debe tener entre 2 y 100 caracteres"
        )
        String etiqueta,

        @Schema(
                description = "Descripción del atributo",
                example = "Combustible utilizado por el vehículo"
        )
        @Size(
                max = 255,
                message = "La descripción no puede superar los 255 caracteres"
        )
        String descripcion,

        @Schema(
                description = "Identificador del tipo de dato",
                example = "a1b2c3d4-e5f6-4011-8001-000000000008",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El tipo de dato es obligatorio")
        UUID tipoDatoId,

        @Schema(
                description = "Orden de visualización",
                example = "1"
        )
        Integer orden,

        @Schema(
                description = "Indica si el atributo es obligatorio",
                example = "true"
        )
        Boolean requerido,

        @Schema(
                description = "Indica si el atributo es visible",
                example = "true"
        )
        Boolean visible,

        @Schema(
                description = "Indica si el atributo es editable",
                example = "true"
        )
        Boolean editable,

        @Schema(
                description = "Valor por defecto del atributo",
                example = "GASOLINA"
        )
        @Size(
                max = 255,
                message = "El valor por defecto no puede superar los 255 caracteres"
        )
        String valorDefecto,

        @Schema(
                description = "Opciones del atributo (solo para SELECT/MULTISELECT)",
                example = "[{\"value\":\"GASOLINA\",\"label\":\"Gasolina\"}]"
        )
        @Valid
        List<ActivoAtributoOpcionDto> opciones
) {
}
