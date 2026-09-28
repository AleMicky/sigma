package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

public record ViajeVehicularRequest(
        @NotNull(message = "La asignación vehicular es obligatoria")
        UUID asignacionVehicularId,

        LocalDateTime fechaSalidaReal,

        @PositiveOrZero(message = "El kilometraje de salida no puede ser negativo")
        Long kilometrajeSalida,

        @Min(value = 0, message = "El nivel de combustible de salida debe ser al menos 0%")
        @Max(value = 100, message = "El nivel de combustible de salida no puede superar el 100%")
        Integer nivelCombustibleSalida,

        LocalDateTime fechaRetornoReal,

        @PositiveOrZero(message = "El kilometraje de retorno no puede ser negativo")
        Long kilometrajeRetorno,

        @Min(value = 0, message = "El nivel de combustible de retorno debe ser al menos 0%")
        @Max(value = 100, message = "El nivel de combustible de retorno no puede superar el 100%")
        Integer nivelCombustibleRetorno,

        EstadoViajeVehicular estado,

        @Size(max = 1000, message = "La observación no puede superar los 1000 caracteres")
        String observacion
) {
}
