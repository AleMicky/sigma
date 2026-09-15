package com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ControlActivoDetalleRequest(
        @NotNull(message = "El accesorio es obligatorio")
        UUID accesorioId,

        @NotNull(message = "La cantidad esperada es obligatoria")
        @PositiveOrZero(message = "La cantidad esperada no puede ser negativa")
        Integer cantidadEsperada,

        @NotNull(message = "La cantidad encontrada es obligatoria")
        @PositiveOrZero(message = "La cantidad encontrada no puede ser negativa")
        Integer cantidadEncontrada,

        boolean conforme,

        @Size(max = 300, message = "La observación no puede superar los 300 caracteres")
        String observacion
) {
}
