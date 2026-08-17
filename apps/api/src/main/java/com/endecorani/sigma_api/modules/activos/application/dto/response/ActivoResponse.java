package com.endecorani.sigma_api.modules.activos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.UUID;

@Schema(
        name = "ActivoResponse",
        description = "Información de un activo"
)
public record ActivoResponse(
        UUID id,
        String codigo,
        String nombre,
        String descripcion,
        TipoActivoInfo tipoActivo,
        UbicacionInfo ubicacion,
        LocalDate fechaAdquisicion,
        String urlImagen,
        Boolean activo,
        AuditoriaResponse auditoria
) {
    public record TipoActivoInfo(
            UUID id,
            UUID categoriaId,
            String nombre,
            String descripcion
    ) {

    }

    public record UbicacionInfo(
            UUID id,
            String codigo,
            String nombre
    ) {

    }
}
