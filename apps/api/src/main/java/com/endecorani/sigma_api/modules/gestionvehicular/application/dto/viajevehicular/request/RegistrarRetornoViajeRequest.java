package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record RegistrarRetornoViajeRequest(
        LocalDateTime fechaRetornoReal,

        @NotNull(message = "El kilometraje de retorno es obligatorio")
        @PositiveOrZero(message = "El kilometraje de retorno no puede ser negativo")
        Long kilometrajeRetorno,

        @Min(value = 0, message = "El nivel de combustible debe ser al menos 0%")
        @Max(value = 100, message = "El nivel de combustible no puede superar el 100%")
        Integer nivelCombustibleRetorno,

        @Size(max = 1000, message = "La observación no puede superar los 1000 caracteres")
        String observacion
) {
}
