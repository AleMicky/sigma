package com.endecorani.sigma_api.modules.mantenimientos.presentation.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ActualizarTipoMantenimientoRequest(

        @NotBlank(message = "El código es obligatorio")
        @Size(max = 50)
        String codigo,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150)
        String nombre,

        @Size(max = 500)
        String descripcion

) {
}