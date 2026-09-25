package com.endecorani.sigma_api.modules.gestionvehicular.application.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.tiposolicitudvehicular.request.TipoSolicitudVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.tiposolicitudvehicular.request.TipoSolicitudVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.tiposolicitudvehicular.response.TipoSolicitudVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.TipoSolicitudVehicular;
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
public interface TipoSolicitudVehicularMapper {

    @Mapping(target = "id", ignore = true)
    TipoSolicitudVehicular toDomain(TipoSolicitudVehicularRequest dto);

    @Mapping(target = "auditoria", source = ".")
    TipoSolicitudVehicularResponse toResponse(TipoSolicitudVehicular domain);

    @Mapping(target = "id", ignore = true)
    void updateDomain(TipoSolicitudVehicularUpdate dto, @MappingTarget TipoSolicitudVehicular domain);

    @Mapping(target = "id", ignore = true)
    void updateDomainFromRequest(TipoSolicitudVehicularRequest dto, @MappingTarget TipoSolicitudVehicular domain);
}
