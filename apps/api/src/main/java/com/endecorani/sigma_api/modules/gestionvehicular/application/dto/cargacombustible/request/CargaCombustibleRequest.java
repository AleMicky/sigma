package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record CargaCombustibleRequest(
        @NotNull(message = "El activo/vehículo es obligatorio")
        UUID activoId,

        UUID viajeVehicularId,

        UUID salidaVehicularId,

        @NotNull(message = "El insumo (combustible) es obligatorio")
        UUID insumoId,

        LocalDateTime fechaCarga,

        @NotNull(message = "Los litros cargados son obligatorios")
        @DecimalMin(value = "0.001", message = "Los litros deben ser mayores a 0")
        BigDecimal litros,

        @NotNull(message = "El precio total es obligatorio")
        @DecimalMin(value = "0.01", message = "El precio total debe ser mayor a 0")
        BigDecimal precioTotal,

        @Size(max = 100, message = "El número de factura no debe exceder 100 caracteres")
        String numeroFactura,

        @NotNull(message = "El empleado que registra/recibe es obligatorio")
        UUID empleadoId,

        BigDecimal latitud,

        BigDecimal longitud
) {
}
