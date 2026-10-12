package com.endecorani.sigma_api.modules.gestionvehicular.application.mapper;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.request.CargaCombustibleRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.request.CargaCombustibleUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.response.*;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.CargaCombustible;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaResponseMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Mapper(
        componentModel = "spring",
        uses = AuditoriaResponseMapper.class,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface CargaCombustibleMapper {

    @Mapping(target = "id", ignore = true)
    CargaCombustible toDomain(CargaCombustibleRequest dto);

    @Mapping(target = "auditoria", source = "domain")
    @Mapping(target = "id", source = "domain.id")
    @Mapping(target = "activoId", source = "domain.activoId")
    @Mapping(target = "activo", source = "activo")
    @Mapping(target = "viajeVehicularId", source = "domain.viajeVehicularId")
    @Mapping(target = "viajeVehicular", source = "viajeVehicular")
    @Mapping(target = "insumoId", source = "domain.insumoId")
    @Mapping(target = "insumo", source = "insumo")
    @Mapping(target = "fechaCarga", source = "domain.fechaCarga")
    @Mapping(target = "litros", source = "domain.litros")
    @Mapping(target = "precioTotal", source = "domain.precioTotal")
    @Mapping(target = "precioPorLitro", expression = "java(calcularPrecioPorLitro(domain))")
    @Mapping(target = "numeroFactura", source = "domain.numeroFactura")
    @Mapping(target = "empleadoId", source = "domain.empleadoId")
    @Mapping(target = "empleado", source = "empleado")
    CargaCombustibleResponse toResponse(
            CargaCombustible domain,
            CargaCombustibleActivoInfo activo,
            CargaCombustibleViajeInfo viajeVehicular,
            CargaCombustibleInsumoInfo insumo,
            CargaCombustibleEmpleadoInfo empleado
    );

    default CargaCombustibleResponse toResponse(CargaCombustible domain) {
        return toResponse(domain, null, null, null, null);
    }

    default BigDecimal calcularPrecioPorLitro(CargaCombustible domain) {
        if (domain == null || domain.getLitros() == null || domain.getPrecioTotal() == null) {
            return null;
        }
        if (domain.getLitros().compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        return domain.getPrecioTotal().divide(domain.getLitros(), 2, RoundingMode.HALF_UP);
    }

    @Mapping(target = "id", ignore = true)
    void updateDomain(CargaCombustibleUpdate dto, @MappingTarget CargaCombustible domain);

    @Mapping(target = "id", ignore = true)
    void updateDomainFromRequest(CargaCombustibleRequest dto, @MappingTarget CargaCombustible domain);
}
