package com.endecorani.sigma_api.modules.mantenimientos.application.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoAdjuntoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoAdjuntoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoAdjuntoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoAdjunto;
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
    @Mapping(target = "activo.id", source = "activoId")
    @Mapping(target = "tipoMantenimiento.id", source = "tipoMantenimientoId")
    @Mapping(target = "prioridad.id", source = "prioridadId")
    @Mapping(target = "solicitante.id", source = "solicitanteId")
    SolicitudMantenimiento toDomain(SolicitudMantenimientoRequest dto);

    @Mapping(target = "auditoria", source = ".")
    @Mapping(target = "responsab", source = "responsable")
    SolicitudMantenimientoResponse toResponse(SolicitudMantenimiento domain);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "numero", ignore = true)
    @Mapping(target = "fechaSolicitud", ignore = true)
    @Mapping(target = "solicitante", ignore = true)
    @Mapping(target = "processInstanceId", ignore = true)
    @Mapping(target = "activo.id", source = "activoId")
    @Mapping(target = "tipoMantenimiento.id", source = "tipoMantenimientoId")
    @Mapping(target = "prioridad.id", source = "prioridadId")
    @Mapping(target = "aprobador.id", source = "aprobadorId")
    @Mapping(target = "responsable.id", source = "responsableId")
    @Mapping(target = "supervisor.id", source = "supervisorId")
    void updateDomain(SolicitudMantenimientoUpdate dto, @MappingTarget SolicitudMantenimiento domain);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "solicitudMantenimientoId", ignore = true)
    SolicitudMantenimientoAdjunto toAdjuntoDomain(SolicitudMantenimientoAdjuntoRequest dto);

    @Mapping(target = "solicitudMantenimientoId", ignore = true)
    void updateAdjuntoDomain(SolicitudMantenimientoAdjuntoUpdate dto, @MappingTarget SolicitudMantenimientoAdjunto domain);

    SolicitudMantenimientoAdjuntoResponse toAdjuntoResponse(SolicitudMantenimientoAdjunto domain);
}
