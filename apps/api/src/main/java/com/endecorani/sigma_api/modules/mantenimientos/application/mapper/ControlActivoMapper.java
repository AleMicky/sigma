package com.endecorani.sigma_api.modules.mantenimientos.application.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.request.ControlActivoDetalleRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.request.ControlActivoDetalleUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.request.ControlActivoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.request.ControlActivoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.response.ControlActivoDetalleResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.response.ControlActivoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivoDetalle;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaResponseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        uses = AuditoriaResponseMapper.class,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface ControlActivoMapper {

    @Mapping(target = "id", ignore = true)
    ControlActivo toDomain(ControlActivoRequest dto);

    @Mapping(target = "auditoria", source = ".")
    ControlActivoResponse toResponse(ControlActivo domain);

    @Mapping(target = "id", ignore = true)
    void updateDomain(ControlActivoUpdate dto, @MappingTarget ControlActivo domain);

    @Mapping(target = "id", ignore = true)
    ControlActivoDetalle toDetalleDomain(ControlActivoDetalleRequest dto);

    @Mapping(target = "controlActivoId", ignore = true)
    void updateDetalleDomain(ControlActivoDetalleUpdate dto, @MappingTarget ControlActivoDetalle domain);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "controlActivoId", ignore = true)
    void updateDetalleFromRequest(ControlActivoDetalleRequest dto, @MappingTarget ControlActivoDetalle domain);

    ControlActivoDetalleResponse toDetalleResponse(ControlActivoDetalle domain);
}
