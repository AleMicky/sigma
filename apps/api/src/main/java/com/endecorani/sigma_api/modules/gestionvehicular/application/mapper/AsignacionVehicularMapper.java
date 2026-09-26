package com.endecorani.sigma_api.modules.gestionvehicular.application.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.request.AsignacionVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.request.AsignacionVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.response.*;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.AsignacionVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicular;
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
public interface AsignacionVehicularMapper {

    @Mapping(target = "id", ignore = true)
    AsignacionVehicular toDomain(AsignacionVehicularRequest dto);

    @Mapping(target = "auditoria", source = "domain")
    @Mapping(target = "id", source = "domain.id")
    @Mapping(target = "solicitudVehicularId", source = "domain.solicitudVehicularId")
    @Mapping(target = "solicitudVehicular", source = "solicitudVehicular")
    @Mapping(target = "activoId", source = "domain.activoId")
    @Mapping(target = "activo", source = "activo")
    @Mapping(target = "conductorId", source = "domain.conductorId")
    @Mapping(target = "conductor", source = "conductor")
    @Mapping(target = "asignadoPorId", source = "domain.asignadoPorId")
    @Mapping(target = "asignadoPor", source = "asignadoPor")
    @Mapping(target = "fechaAsignacion", source = "domain.fechaAsignacion")
    @Mapping(target = "observacion", source = "domain.observacion")
    AsignacionVehicularResponse toResponse(
            AsignacionVehicular domain,
            AsignacionVehicularSolicitudInfo solicitudVehicular,
            AsignacionVehicularActivoInfo activo,
            AsignacionVehicularConductorInfo conductor,
            AsignacionVehicularEmpleadoInfo asignadoPor
    );

    default AsignacionVehicularResponse toResponse(AsignacionVehicular domain) {
        return toResponse(domain, null, null, null, null);
    }

    AsignacionVehicularSolicitudInfo toSolicitudInfo(SolicitudVehicular solicitud);

    @Mapping(target = "id", ignore = true)
    void updateDomain(AsignacionVehicularUpdate dto, @MappingTarget AsignacionVehicular domain);

    @Mapping(target = "id", ignore = true)
    void updateDomainFromRequest(AsignacionVehicularRequest dto, @MappingTarget AsignacionVehicular domain);
}
