package com.endecorani.sigma_api.modules.activos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

/**
 * REQ-BIZ-004: reemplazo atómico del conjunto completo de valores de atributos
 * de un activo. El servidor valida que estén todos los atributos requeridos
 * del tipo de activo antes de tocar la base de datos.
 */
@Schema(
        name = "ActivoAtributosReplacementRequest",
        description = "Conjunto completo de valores de atributos a persistir para un activo"
)
public record ActivoAtributosReplacementRequest(
        @NotNull(message = "La lista 'valores' es obligatoria")
        @Schema(description = "Valores a reemplazar; se admite una lista vacía si el tipo no tiene atributos requeridos")
        List<@Valid AtributoValorItem> valores
) {
    public record AtributoValorItem(
            @NotNull(message = "El atributo es obligatorio")
            @Schema(
                    description = "Identificador del atributo del catálogo del tipo de activo",
                    requiredMode = Schema.RequiredMode.REQUIRED
            )
            UUID atributoId,

            @Size(max = 4000, message = "El valor no puede superar los 4000 caracteres")
            @Schema(description = "Valor del atributo (se valida según su tipo de dato)")
            String valor
    ) {
    }
}
