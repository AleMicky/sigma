package com.endecorani.sigma_api.modules.inventarios.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "CategoriaInsumoResponse",
        description = "Información de una categoría de insumo"
)
public record CategoriaInsumoResponse(
        UUID id,
        TipoInsumoInfo tipoInsumo,
        String codigo,
        String nombre,
        String descripcion,
        AuditoriaResponse auditoria
) {
    public record TipoInsumoInfo(
            UUID id,
            String codigo,
            String nombre
    ) {

    }
}
