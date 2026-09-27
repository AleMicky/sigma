package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoLicenciaConductor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record ConductorLicenciaRequest(
        UUID id,

        @NotBlank(message = "La categoría de licencia es obligatoria")
        @Size(max = 20, message = "La categoría de licencia no puede superar los 20 caracteres")
        String categoriaLicencia,

        @NotBlank(message = "El número de licencia es obligatorio")
        @Size(max = 100, message = "El número de licencia no puede superar los 100 caracteres")
        String numeroLicencia,

        @NotNull(message = "La fecha de emisión es obligatoria")
        LocalDate fechaEmision,

        @NotNull(message = "La fecha de vencimiento es obligatoria")
        LocalDate fechaVencimiento,

        EstadoLicenciaConductor estado,

        @Size(max = 255, message = "El nombre del archivo no puede superar los 255 caracteres")
        String nombreArchivo,

        @Size(max = 255, message = "El nombre original no puede superar los 255 caracteres")
        String nombreOriginal,

        @Size(max = 1000, message = "La URL no puede superar los 1000 caracteres")
        String url,

        @Size(max = 100, message = "El MIME type no puede superar los 100 caracteres")
        String mimeType,

        Long size,

        @Size(max = 1000, message = "La observación no puede superar los 1000 caracteres")
        String observacion,

        Boolean activo
) {
}
