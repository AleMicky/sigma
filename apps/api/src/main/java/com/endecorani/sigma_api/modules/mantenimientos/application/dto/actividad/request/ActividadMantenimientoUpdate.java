package com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ActividadMantenimientoUpdate(
        @NotBlank(message = "El código es obligatorio")
        @Size(max = 50, message = "El código no puede superar los 50 caracteres")
        String codigo,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150, message = "El nombre no puede superar los 150 caracteres")
        String nombre,

        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
        String descripcion,

        @Valid
        List<ActividadMantenimientoAplicacionUpdate> aplicaciones
) {
}
