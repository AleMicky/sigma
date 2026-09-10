package com.endecorani.sigma_api.modules.mantenimientos.application.dto.prioridad.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PrioridadUpdate(
        @NotBlank(message = "El código es obligatorio")
        @Size(max = 20, message = "El código no puede superar los 20 caracteres")
        String codigo,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
        String nombre,

        @Size(max = 255, message = "La descripción no puede superar los 255 caracteres")
        String descripcion,

        @NotNull(message = "El nivel es obligatorio")
        Integer nivel,

        @NotNull(message = "El indicador por defecto es obligatorio")
        Boolean porDefecto
) {
}