package com.endecorani.sigma_api.modules.mantenimientos.application.mapper;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request.*;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response.*;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividadEvidencia;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoAdjunto;
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
public interface OrdenTrabajoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "numero", ignore = true)
    OrdenTrabajo toDomain(OrdenTrabajoRequest dto);

    @Mapping(target = "auditoria", source = ".")
    OrdenTrabajoResponse toResponse(OrdenTrabajo domain);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "numero", ignore = true)
    void updateDomain(OrdenTrabajoUpdate dto, @MappingTarget OrdenTrabajo domain);

    @Mapping(target = "id", ignore = true)
    OrdenTrabajoActividad toActividadDomain(OrdenTrabajoActividadRequest dto);

    @Mapping(target = "ordenTrabajoId", ignore = true)
    void updateActividadDomain(OrdenTrabajoActividadUpdate dto, @MappingTarget OrdenTrabajoActividad domain);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ordenTrabajoId", ignore = true)
    @Mapping(target = "evidencias", ignore = true)
    void updateActividadFromRequest(OrdenTrabajoActividadRequest dto, @MappingTarget OrdenTrabajoActividad domain);

    OrdenTrabajoActividadResponse toActividadResponse(OrdenTrabajoActividad domain);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ordenTrabajoActividadId", ignore = true)
    OrdenTrabajoActividadEvidencia toEvidenciaDomain(OrdenTrabajoActividadEvidenciaRequest dto);

    @Mapping(target = "ordenTrabajoActividadId", ignore = true)
    void updateEvidenciaDomain(OrdenTrabajoActividadEvidenciaUpdate dto, @MappingTarget OrdenTrabajoActividadEvidencia domain);

    OrdenTrabajoActividadEvidenciaResponse toEvidenciaResponse(OrdenTrabajoActividadEvidencia domain);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ordenTrabajoId", ignore = true)
    OrdenTrabajoAdjunto toAdjuntoDomain(OrdenTrabajoAdjuntoRequest dto);

    @Mapping(target = "ordenTrabajoId", ignore = true)
    void updateAdjuntoDomain(OrdenTrabajoAdjuntoUpdate dto, @MappingTarget OrdenTrabajoAdjunto domain);

    OrdenTrabajoAdjuntoResponse toAdjuntoResponse(OrdenTrabajoAdjunto domain);
}
