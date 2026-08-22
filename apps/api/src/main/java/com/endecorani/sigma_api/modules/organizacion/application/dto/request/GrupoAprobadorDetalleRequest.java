package com.endecorani.sigma_api.modules.organizacion.application.dto.request;

import com.endecorani.sigma_api.modules.organizacion.domain.enums.AlcanceAprobador;
import com.endecorani.sigma_api.modules.organizacion.domain.enums.TipoAprobador;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(
        name = "GrupoAprobadorDetalleRequest",
        description = "Datos necesarios para registrar o actualizar un aprobador dentro de un grupo aprobador"
)
public record GrupoAprobadorDetalleRequest(
        @Schema(
                description = "Tipo de aprobador que identifica la referencia obligatoria",
                example = "EMPLEADO",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El tipo de aprobador es obligatorio")
        TipoAprobador tipoAprobador,

        @Schema(
                description = "Identificador del empleado cuando el tipo de aprobador es EMPLEADO",
                requiredMode = Schema.RequiredMode.AUTO
        )
        UUID empleadoId,

        @Schema(
                description = "Identificador del cargo cuando el tipo de aprobador es CARGO",
                requiredMode = Schema.RequiredMode.AUTO
        )
        UUID cargoId,

        @Schema(
                description = "Identificador de la responsabilidad cuando el tipo de aprobador es RESPONSABILIDAD",
                requiredMode = Schema.RequiredMode.AUTO
        )
        UUID responsabilidadId,

        @Schema(
                description = "Alcance en el que el aprobador participa",
                example = "GLOBAL",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El alcance es obligatorio")
        AlcanceAprobador alcance,

        @Schema(
                description = "Orden de aprobación dentro del grupo (mayor a 0)",
                example = "1",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El orden es obligatorio")
        @Min(value = 0, message = "El orden no puede ser menor a 0")
        Integer orden,

        @Schema(
                description = "Indica si el paso requiere aprobación explícita",
                example = "true",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El indicador requiereAprobacion es obligatorio")
        Boolean requiereAprobacion
) {
}
