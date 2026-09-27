package com.endecorani.sigma_api.modules.gestionvehicular.application.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehicular.request.FlotaVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehicular.request.FlotaVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehicular.response.FlotaVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehicular;
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
public interface FlotaVehicularMapper {

    @Mapping(target = "id", ignore = true)
    FlotaVehicular toDomain(FlotaVehicularRequest dto);

    @Mapping(target = "auditoria", source = ".")
    FlotaVehicularResponse toResponse(FlotaVehicular domain);

    @Mapping(target = "id", ignore = true)
    void updateDomain(FlotaVehicularUpdate dto, @MappingTarget FlotaVehicular domain);

    @Mapping(target = "id", ignore = true)
    void updateDomainFromRequest(FlotaVehicularRequest dto, @MappingTarget FlotaVehicular domain);
}
