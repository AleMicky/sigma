package com.endecorani.sigma_api.modules.gestionvehicular.application.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorLicenciaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response.ConductorEmpleadoInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response.ConductorLicenciaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response.ConductorResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ConductorLicencia;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaResponseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = AuditoriaResponseMapper.class,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface ConductorMapper {

    @Mapping(target = "id", ignore = true)
    Conductor toDomain(ConductorRequest dto);

    @Mapping(target = "auditoria", source = "domain")
    @Mapping(target = "id", source = "domain.id")
    @Mapping(target = "empleadoId", source = "domain.empleadoId")
    @Mapping(target = "estado", source = "domain.estado")
    @Mapping(target = "observacion", source = "domain.observacion")
    @Mapping(target = "activo", source = "domain.activo")
    @Mapping(target = "empleado", source = "empleado")
    @Mapping(target = "licencias", source = "domain.licencias")
    ConductorResponse toResponse(Conductor domain, ConductorEmpleadoInfo empleado);

    default ConductorResponse toResponse(Conductor domain) {
        return toResponse(domain, (ConductorEmpleadoInfo) null);
    }

    ConductorEmpleadoInfo toEmpleadoInfo(Empleado empleado);

    @Mapping(target = "id", ignore = true)
    void updateDomain(ConductorUpdate dto, @MappingTarget Conductor domain);

    @Mapping(target = "id", ignore = true)
    void updateDomainFromRequest(ConductorRequest dto, @MappingTarget Conductor domain);

    ConductorLicencia toDomain(ConductorLicenciaRequest dto);

    @Mapping(target = "auditoria", source = "domain")
    ConductorLicenciaResponse toResponse(ConductorLicencia domain);

    List<ConductorLicencia> toDomainList(List<ConductorLicenciaRequest> dtoList);

    List<ConductorLicenciaResponse> toResponseList(List<ConductorLicencia> domainList);
}
