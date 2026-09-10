package com.endecorani.sigma_api.modules.mantenimientos.application.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
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
public interface SolicitudMantenimientoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "numero", ignore = true)
    @Mapping(target = "fechaSolicitud", ignore = true)
    @Mapping(target = "processInstanceId", ignore = true)
    @Mapping(target = "estado", ignore = true)
    SolicitudMantenimiento toDomain(SolicitudMantenimientoRequest dto);

    @Mapping(target = "auditoria", source = ".")
    SolicitudMantenimientoResponse toResponse(SolicitudMantenimiento domain);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "numero", ignore = true)
    @Mapping(target = "fechaSolicitud", ignore = true)
    @Mapping(target = "solicitanteId", ignore = true)
    @Mapping(target = "processInstanceId", ignore = true)
    void updateDomain(SolicitudMantenimientoUpdate dto, @MappingTarget SolicitudMantenimiento domain);
}
