package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.tiposolicitudvehicular.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TipoSolicitudVehicularRequest(
        @NotBlank(message = "El código es obligatorio")
        @Size(max = 50, message = "El código no puede superar los 50 caracteres")
        String codigo,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150, message = "El nombre no puede superar los 150 caracteres")
        String nombre,

        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
        String descripcion,

        @NotNull(message = "Los días de anticipación son obligatorios")
        @Min(value = 0, message = "Los días de anticipación no pueden ser negativos")
        Integer diasAnticipacion,

        @NotNull(message = "El campo requiere respaldo es obligatorio")
        Boolean requiereRespaldo,

        @NotNull(message = "El campo requiere justificación es obligatorio")
        Boolean requiereJustificacion
) {
}

