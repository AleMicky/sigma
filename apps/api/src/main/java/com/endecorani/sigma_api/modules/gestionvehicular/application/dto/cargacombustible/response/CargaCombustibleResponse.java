package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record CargaCombustibleResponse(
        UUID id,
        UUID activoId,
        CargaCombustibleActivoInfo activo,
        UUID viajeVehicularId,
        CargaCombustibleViajeInfo viajeVehicular,
        UUID insumoId,
        CargaCombustibleInsumoInfo insumo,
        LocalDateTime fechaCarga,
        BigDecimal litros,
        BigDecimal precioTotal,
        BigDecimal precioPorLitro,
        String numeroFactura,
        UUID empleadoId,
        CargaCombustibleEmpleadoInfo empleado,
        AuditoriaResponse auditoria
) {
}
