package com.endecorani.sigma_api.modules.gestionvehicular.application.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.response.AsignacionVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request.ViajeVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request.ViajeVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.response.ViajeVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ViajeVehicular;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaResponseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        uses = AuditoriaResponseMapper.class,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface ViajeVehicularMapper {

    @Mapping(target = "id", ignore = true)
    ViajeVehicular toDomain(ViajeVehicularRequest dto);

    @Mapping(target = "auditoria", source = "domain")
    @Mapping(target = "id", source = "domain.id")
    @Mapping(target = "asignacionVehicularId", source = "domain.asignacionVehicularId")
    @Mapping(target = "asignacionVehicular", source = "asignacionVehicular")
    @Mapping(target = "fechaSalidaReal", source = "domain.fechaSalidaReal")
    @Mapping(target = "kilometrajeSalida", source = "domain.kilometrajeSalida")
    @Mapping(target = "nivelCombustibleSalida", source = "domain.nivelCombustibleSalida")
    @Mapping(target = "fechaRetornoReal", source = "domain.fechaRetornoReal")
    @Mapping(target = "kilometrajeRetorno", source = "domain.kilometrajeRetorno")
    @Mapping(target = "nivelCombustibleRetorno", source = "domain.nivelCombustibleRetorno")
    @Mapping(target = "estado", source = "domain.estado")
    @Mapping(target = "observacion", source = "domain.observacion")
    ViajeVehicularResponse toResponse(
            ViajeVehicular domain,
            AsignacionVehicularResponse asignacionVehicular
    );

    default ViajeVehicularResponse toResponse(ViajeVehicular domain) {
        return toResponse(domain, null);
    }

    @Mapping(target = "id", ignore = true)
    void updateDomain(ViajeVehicularUpdate dto, @MappingTarget ViajeVehicular domain);

    @Mapping(target = "id", ignore = true)
    void updateDomainFromRequest(ViajeVehicularRequest dto, @MappingTarget ViajeVehicular domain);
}
