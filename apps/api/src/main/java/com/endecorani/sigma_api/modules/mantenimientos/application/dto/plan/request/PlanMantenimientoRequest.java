package com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record PlanMantenimientoRequest(
        @NotNull(message = "El tipo de activo es obligatorio")
        UUID tipoActivoId,

        @NotBlank(message = "El código es obligatorio")
        @Size(max = 30, message = "El código no puede superar los 30 caracteres")
        String codigo,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 200, message = "El nombre no puede superar los 200 caracteres")
        String nombre,

        String descripcion
) {
}
