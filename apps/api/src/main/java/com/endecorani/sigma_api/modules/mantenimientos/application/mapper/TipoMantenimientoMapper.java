package com.endecorani.sigma_api.modules.mantenimientos.application.mapper;


import com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.request.TipoMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.request.TipoMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.response.TipoMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.TipoMantenimiento;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TipoMantenimientoMapper {

    @Mapping(target = "id", ignore = true)
    TipoMantenimiento toDomain(TipoMantenimientoRequest dto);

    TipoMantenimientoResponse toResponse(TipoMantenimiento domain);

    void updateDomain(TipoMantenimientoUpdate dto, @MappingTarget TipoMantenimiento domain);
}