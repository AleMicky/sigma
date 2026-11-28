package com.endecorani.sigma_api.modules.cuestionarios.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CuestionarioRequest(
        @NotBlank(message = "El código es obligatorio")
        @Size(max = 50, message = "El código no puede exceder 50 caracteres")
        String codigo,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150, message = "El nombre no puede exceder 150 caracteres")
        String nombre,

        String descripcion,

        @NotBlank(message = "El módulo de origen es obligatorio")
        @Size(max = 50, message = "El módulo de origen no puede exceder 50 caracteres")
        String moduloOrigen,

        @NotBlank(message = "El tipo de entidad es obligatorio")
        @Size(max = 60, message = "El tipo de entidad no puede exceder 60 caracteres")
        String entidadTipo,

        @NotBlank(message = "El evento disparador es obligatorio")
        @Size(max = 60, message = "El evento disparador no puede exceder 60 caracteres")
        String eventoDisparador,

        Boolean obligatorio,

        Boolean anonimoEnReportes,

        Boolean activo
) {}
