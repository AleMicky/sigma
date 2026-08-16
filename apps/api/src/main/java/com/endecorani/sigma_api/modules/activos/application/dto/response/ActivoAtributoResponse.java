package com.endecorani.sigma_api.modules.activos.application.dto.response;

import com.endecorani.sigma_api.modules.activos.application.dto.ActivoAtributoOpcionDto;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Schema(
        name = "ActivoAtributoResponse",
        description = "Información de un atributo de tipo de activo"
)
public record ActivoAtributoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Identificador del tipo de activo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID tipoActivoId,

        @Schema(
                description = "Código del atributo",
                example = "TIPO_COMBUSTIBLE"
        )
        String codigo,

        @Schema(
                description = "Etiqueta visible",
                example = "Tipo de combustible"
        )
        String etiqueta,

        @Schema(
                description = "Descripción",
                example = "Combustible utilizado por el vehículo"
        )
        String descripcion,

        @Schema(
                description = "Identificador del tipo de dato",
                example = "a1b2c3d4-e5f6-4011-8001-000000000008"
        )
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
                description = "Valor por defecto",
                example = "GASOLINA"
        )
        String valorDefecto,

        @Schema(
                description = "Opciones del atributo (solo para SELECT/MULTISELECT)"
        )
        List<ActivoAtributoOpcionDto> opciones,

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
