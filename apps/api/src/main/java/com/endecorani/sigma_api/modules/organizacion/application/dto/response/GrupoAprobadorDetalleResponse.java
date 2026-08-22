package com.endecorani.sigma_api.modules.organizacion.application.dto.response;

import com.endecorani.sigma_api.modules.organizacion.domain.enums.TipoAprobador;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.dto.response.CatalogoResumenResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "GrupoAprobadorDetalleResponse",
        description = "Información de un aprobador perteneciente a un grupo aprobador"
)
public record GrupoAprobadorDetalleResponse(
        UUID id,
        CatalogoResumenResponse grupoAprobadorInfo,
        TipoAprobador tipoAprobador,
        EmpleadoResumenResponse empleadoInfo,
        CatalogoResumenResponse cargoInfo,
        CatalogoResumenResponse responsabilidadInfo,
        Integer orden,
        Boolean requiereAprobacion,
        AuditoriaResponse auditoria
) {
}
