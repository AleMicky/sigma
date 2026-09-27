package com.endecorani.sigma_api.modules.gestionvehicular.application.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request.FlotaVehiculoRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request.FlotaVehiculoUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response.FlotaVehiculoActivoInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response.FlotaVehiculoFlotaInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response.FlotaVehiculoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehiculo;
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
public interface FlotaVehiculoMapper {

    @Mapping(target = "id", ignore = true)
    FlotaVehiculo toDomain(FlotaVehiculoRequest dto);

    @Mapping(target = "auditoria", source = "domain")
    @Mapping(target = "id", source = "domain.id")
    @Mapping(target = "flotaVehicularId", source = "domain.flotaVehicularId")
    @Mapping(target = "activoId", source = "domain.activoId")
    @Mapping(target = "activo", source = "domain.activo")
    @Mapping(target = "flota", source = "flotaInfo")
    @Mapping(target = "vehiculo", source = "activoInfo")
    FlotaVehiculoResponse toResponse(FlotaVehiculo domain, FlotaVehiculoFlotaInfo flotaInfo, FlotaVehiculoActivoInfo activoInfo);

    @Mapping(target = "auditoria", source = ".")
    @Mapping(target = "flota", ignore = true)
    @Mapping(target = "vehiculo", ignore = true)
    FlotaVehiculoResponse toResponse(FlotaVehiculo domain);

    @Mapping(target = "id", ignore = true)
    void updateDomain(FlotaVehiculoUpdate dto, @MappingTarget FlotaVehiculo domain);

    @Mapping(target = "id", ignore = true)
    void updateDomainFromRequest(FlotaVehiculoRequest dto, @MappingTarget FlotaVehiculo domain);

    FlotaVehiculoFlotaInfo toFlotaInfo(FlotaVehicular flota);
}
