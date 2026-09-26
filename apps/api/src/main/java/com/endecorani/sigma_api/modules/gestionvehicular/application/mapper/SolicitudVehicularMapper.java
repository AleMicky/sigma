package com.endecorani.sigma_api.modules.gestionvehicular.application.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularAdjuntoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularSolicitanteInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularTipoSolicitudInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.TipoSolicitudVehicular;
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
public interface SolicitudVehicularMapper {

    @Mapping(target = "id", ignore = true)
    SolicitudVehicular toDomain(SolicitudVehicularRequest dto);

    @Mapping(target = "auditoria", source = "domain")
    @Mapping(target = "id", source = "domain.id")
    @Mapping(target = "numero", source = "domain.numero")
    @Mapping(target = "tipoSolicitudVehicularId", source = "domain.tipoSolicitudVehicularId")
    @Mapping(target = "tipoSolicitudVehicular", source = "tipoSolicitud")
    @Mapping(target = "solicitanteId", source = "domain.solicitanteId")
    @Mapping(target = "solicitante", source = "solicitante")
    @Mapping(target = "motivo", source = "domain.motivo")
    @Mapping(target = "justificacion", source = "domain.justificacion")
    @Mapping(target = "destino", source = "domain.destino")
    @Mapping(target = "fechaSalida", source = "domain.fechaSalida")
    @Mapping(target = "fechaRetornoEstimada", source = "domain.fechaRetornoEstimada")
    @Mapping(target = "cantidadPasajeros", source = "domain.cantidadPasajeros")
    @Mapping(target = "observacion", source = "domain.observacion")
    @Mapping(target = "estado", source = "domain.estado")
    @Mapping(target = "processInstanceId", source = "domain.processInstanceId")
    @Mapping(target = "adjuntos", source = "adjuntos")
    SolicitudVehicularResponse toResponse(
            SolicitudVehicular domain,
            SolicitudVehicularTipoSolicitudInfo tipoSolicitud,
            SolicitudVehicularSolicitanteInfo solicitante,
            List<SolicitudVehicularAdjuntoResponse> adjuntos
    );

    default SolicitudVehicularResponse toResponse(
            SolicitudVehicular domain,
            SolicitudVehicularTipoSolicitudInfo tipoSolicitud,
            SolicitudVehicularSolicitanteInfo solicitante
    ) {
        return toResponse(domain, tipoSolicitud, solicitante, null);
    }

    default SolicitudVehicularResponse toResponse(SolicitudVehicular domain) {
        return toResponse(domain, null, null, null);
    }

    SolicitudVehicularTipoSolicitudInfo toTipoInfo(TipoSolicitudVehicular tipo);

    SolicitudVehicularSolicitanteInfo toSolicitanteInfo(Empleado empleado);

    @Mapping(target = "id", ignore = true)
    void updateDomain(SolicitudVehicularUpdate dto, @MappingTarget SolicitudVehicular domain);

    @Mapping(target = "id", ignore = true)
    void updateDomainFromRequest(SolicitudVehicularRequest dto, @MappingTarget SolicitudVehicular domain);
}
