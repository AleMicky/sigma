package com.endecorani.sigma_api.modules.activos.application.dto.request;


import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(
        name = "TiposDocumentoRequest",
        description = "Datos necesarios para registrar o actualizar un tipos de documentos"
)
public record TiposDocumentoRequest(
        @Schema(
                description = "Código único de tipo de documento",
                example = "FACTURA",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del tipo de documento es obligatorio")
        @Size(
                min = 2,
                max = 50,
                message = "El código debe tener entre 2 y 50 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre de tipo documento",
                example = "Factura de compra",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del tipo de documento es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción de tipo documento",
                example = "Documento que acredita la compra del activo."
        )
        @Size(
                max = 255,
                message = "La descripción no puede superar los 255 caracteres"
        )
        String descripcion,

        @Schema(
                description = "Indica si el tipo de documento requiere registrar fecha de vencimiento",
                example = "false"
        )
        Boolean requiereVencimiento
) {
}
