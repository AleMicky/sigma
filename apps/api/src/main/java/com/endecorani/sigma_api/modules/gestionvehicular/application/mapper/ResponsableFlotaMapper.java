package com.endecorani.sigma_api.modules.gestionvehicular.application.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.request.ResponsableFlotaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.request.ResponsableFlotaUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.response.ResponsableFlotaEmpleadoInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.response.ResponsableFlotaFlotaInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.response.ResponsableFlotaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ResponsableFlota;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
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
public interface ResponsableFlotaMapper {

    @Mapping(target = "id", ignore = true)
    ResponsableFlota toDomain(ResponsableFlotaRequest dto);

    @Mapping(target = "auditoria", source = "domain")
    @Mapping(target = "id", source = "domain.id")
    @Mapping(target = "flotaVehicularId", source = "domain.flotaVehicularId")
    @Mapping(target = "empleadoId", source = "domain.empleadoId")
    @Mapping(target = "principal", source = "domain.principal")
    @Mapping(target = "activo", source = "domain.activo")
    @Mapping(target = "flota", source = "flotaInfo")
    @Mapping(target = "empleado", source = "empleadoInfo")
    ResponsableFlotaResponse toResponse(ResponsableFlota domain, ResponsableFlotaFlotaInfo flotaInfo, ResponsableFlotaEmpleadoInfo empleadoInfo);

    @Mapping(target = "auditoria", source = ".")
    @Mapping(target = "flota", ignore = true)
    @Mapping(target = "empleado", ignore = true)
    ResponsableFlotaResponse toResponse(ResponsableFlota domain);

    @Mapping(target = "id", ignore = true)
    void updateDomain(ResponsableFlotaUpdate dto, @MappingTarget ResponsableFlota domain);

    @Mapping(target = "id", ignore = true)
    void updateDomainFromRequest(ResponsableFlotaRequest dto, @MappingTarget ResponsableFlota domain);

    ResponsableFlotaFlotaInfo toFlotaInfo(FlotaVehicular flota);

    @Mapping(target = "id", source = "id")
    ResponsableFlotaEmpleadoInfo toEmpleadoInfo(Empleado empleado);
}
